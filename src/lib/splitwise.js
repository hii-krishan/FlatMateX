export function getMemberKey(member) {
  if (!member) return "";
  if (typeof member === "string") return member.toLowerCase().trim();
  return (member.id || member.email || member.name || "").toString().toLowerCase().trim();
}

export function calculateNetBalances(members = [], expenses = []) {
  const memberMap = new Map();
  const balances = new Map();

  members.forEach((m) => {
    const key = getMemberKey(m);
    memberMap.set(key, m);
    balances.set(key, 0);
  });

  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    if (amount <= 0) return;

    const isSettlement =
      expense.isSettlement ||
      expense.category === "Settlement" ||
      expense.name?.toLowerCase().startsWith("settlement:");

    if (isSettlement) {
      const payerName =
        expense.payerName ||
        expense.paidBy ||
        (expense.name?.includes(" paid ") ? expense.name.replace(/^Settlement:\s*/i, "").split(" paid ")[0]?.trim() : "");
      const receiverName =
        expense.receivedBy ||
        expense.split?.[0]?.name ||
        (expense.name?.includes(" paid ") ? expense.name.split(" paid ")[1]?.trim() : "");

      const payer = members.find(
        (m) =>
          (payerName && m.name?.toLowerCase() === payerName.toLowerCase()) ||
          (expense.payerId && m.id === expense.payerId) ||
          (expense.user_id && m.id === expense.user_id)
      );
      const receiver = members.find(
        (m) =>
          (receiverName && m.name?.toLowerCase() === receiverName.toLowerCase()) ||
          (expense.receiverId && m.id === expense.receiverId)
      );

      const payerKey = payer ? getMemberKey(payer) : payerName;
      const receiverKey = receiver ? getMemberKey(receiver) : receiverName;

      if (payerKey && balances.has(payerKey)) {
        balances.set(payerKey, (balances.get(payerKey) || 0) + amount);
      }
      if (receiverKey && balances.has(receiverKey)) {
        balances.set(receiverKey, (balances.get(receiverKey) || 0) - amount);
      }
      return;
    }

    if (expense.isPersonal || expense.splitOption === "no" || expense.is_personal) return;

    // Find who paid
    const payerKey = getMemberKey(
      members.find(
        (m) =>
          expense.paidBy &&
          (getMemberKey(m) === getMemberKey(expense.paidBy) ||
            m.name?.toLowerCase() === expense.paidBy.toLowerCase())
      ) ||
      members.find(
        (m) =>
          (expense.flatmateId && m.id === expense.flatmateId) ||
          (expense.user_id && m.id === expense.user_id)
      ) ||
      expense.paidBy ||
      "unknown"
    );

    if (!balances.has(payerKey) && payerKey !== "unknown") {
      balances.set(payerKey, 0);
    }

    const splitDetails = expense.split || expense.split_details || [];

    if (splitDetails.length > 0) {
      let totalSplitShares = 0;
      splitDetails.forEach((share) => {
        const shareAmount = Number(share.share || share.amount) || 0;
        totalSplitShares += shareAmount;

        const debtorKey = getMemberKey(
          members.find(
            (m) =>
              (share.email && m.email?.toLowerCase() === share.email.toLowerCase()) ||
              (share.name && m.name?.toLowerCase() === share.name.toLowerCase()) ||
              (share.id && m.id === share.id)
          ) || share.email || share.name || "unknown"
        );

        if (!balances.has(debtorKey) && debtorKey !== "unknown") {
          balances.set(debtorKey, 0);
        }

        if (debtorKey !== "unknown") {
          balances.set(debtorKey, (balances.get(debtorKey) || 0) - shareAmount);
        }
      });

      if (payerKey !== "unknown") {
        balances.set(payerKey, (balances.get(payerKey) || 0) + totalSplitShares);
      }
    } else {
  
      const validMembers = members.length > 0 ? members : [{ id: payerKey, name: expense.paidBy || "Alex" }];
      const perPersonShare = amount / validMembers.length;

      validMembers.forEach((m) => {
        const key = getMemberKey(m);

        balances.set(key, (balances.get(key) || 0) - perPersonShare);
      });


      if (payerKey !== "unknown") {
        balances.set(payerKey, (balances.get(payerKey) || 0) + amount);
      }
    }
  });

  return Array.from(balances.entries()).map(([key, balance]) => {
    const member = memberMap.get(key) || { id: key, name: key };
    return {
      key,
      member,
      balance: Math.round(balance * 100) / 100, 
      isCreditor: balance > 0.01,
      isDebtor: balance < -0.01,
      isSettled: Math.abs(balance) <= 0.01
    };
  });
}


export function simplifyDebts(netBalances = []) {
  const debtors = [];
  const creditors = [];

  netBalances.forEach(({ member, balance }) => {
    if (balance < -0.01) {
      debtors.push({ member, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ member, amount: balance });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0.01) {
      transactions.push({
        id: `trans-${debtor.member.id || debtor.member.name}-${creditor.member.id || creditor.member.name}-${Date.now()}-${transactions.length}`,
        from: debtor.member,
        to: creditor.member,
        amount: Math.round(settleAmount * 100) / 100
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return transactions;
}

export function getPairwiseMatrix(members = [], expenses = []) {
  const matrix = {};

  members.forEach((m1) => {
    const k1 = getMemberKey(m1);
    matrix[k1] = {};
    members.forEach((m2) => {
      const k2 = getMemberKey(m2);
      matrix[k1][k2] = 0;
    });
  });

  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    if (amount <= 0) return;

    const isSettlement =
      expense.isSettlement ||
      expense.category === "Settlement" ||
      expense.name?.toLowerCase().startsWith("settlement:");

    if (isSettlement) {
      const payerName =
        expense.payerName ||
        expense.paidBy ||
        (expense.name?.includes(" paid ") ? expense.name.replace(/^Settlement:\s*/i, "").split(" paid ")[0]?.trim() : "");
      const receiverName =
        expense.receivedBy ||
        expense.split?.[0]?.name ||
        (expense.name?.includes(" paid ") ? expense.name.split(" paid ")[1]?.trim() : "");

      const payer = members.find(
        (m) =>
          (payerName && m.name?.toLowerCase() === payerName.toLowerCase()) ||
          (expense.payerId && m.id === expense.payerId) ||
          (expense.user_id && m.id === expense.user_id)
      );
      const receiver = members.find(
        (m) =>
          (receiverName && m.name?.toLowerCase() === receiverName.toLowerCase()) ||
          (expense.receiverId && m.id === expense.receiverId)
      );

      if (payer && receiver) {
        const pk = getMemberKey(payer);
        const rk = getMemberKey(receiver);
        if (matrix[pk] && matrix[pk][rk] !== undefined) {
          matrix[pk][rk] = Math.max(0, matrix[pk][rk] - amount);
        }
      }
      return;
    }

    if (expense.isPersonal || expense.splitOption === "no" || expense.is_personal) return;

    const payer = members.find(
      (m) =>
        getMemberKey(m) === getMemberKey(expense.paidBy) ||
        m.name?.toLowerCase() === (expense.paidBy || "").toLowerCase()
    );
    if (!payer) return;
    const payerKey = getMemberKey(payer);

    const split = expense.split || expense.split_details || [];
    if (split.length > 0) {
      split.forEach((share) => {
        const debtor = members.find(
          (m) =>
            (share.email && m.email?.toLowerCase() === share.email.toLowerCase()) ||
            (share.name && m.name?.toLowerCase() === share.name.toLowerCase()) ||
            (share.id && m.id === share.id)
        );
        if (debtor) {
          const debtorKey = getMemberKey(debtor);
          if (debtorKey !== payerKey && matrix[debtorKey] && matrix[debtorKey][payerKey] !== undefined) {
            matrix[debtorKey][payerKey] += Number(share.share || share.amount) || 0;
          }
        }
      });
    } else {
      const share = amount / members.length;
      members.forEach((m) => {
        const k = getMemberKey(m);
        if (k !== payerKey && matrix[k] && matrix[k][payerKey] !== undefined) {
          matrix[k][payerKey] += share;
        }
      });
    }
  });

   const pairwiseList = [];
  const visited = new Set();

  members.forEach((m1) => {
    const k1 = getMemberKey(m1);
    members.forEach((m2) => {
      const k2 = getMemberKey(m2);
      if (k1 === k2) return;
      const pairKey = [k1, k2].sort().join("<->");
      if (visited.has(pairKey)) return;
      visited.add(pairKey);

      const d1to2 = matrix[k1]?.[k2] || 0;
      const d2to1 = matrix[k2]?.[k1] || 0;
      const net = d1to2 - d2to1;

      if (net > 0.01) {
        pairwiseList.push({ from: m1, to: m2, amount: Math.round(net * 100) / 100 });
      } else if (net < -0.01) {
        pairwiseList.push({ from: m2, to: m1, amount: Math.round(Math.abs(net) * 100) / 100 });
      }
    });
  });

  return pairwiseList;
}
