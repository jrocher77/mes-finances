const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const genId = () => Math.random().toString(36).slice(2, 10);
const SECRET = "xK9mQ2pLw7nTjR4vBs6Y";
const monthKey = (date) => String(date || "").slice(0, 7);

function computeBaseMonthBalance(transactions, accountId, targetMonthKey) {
  return transactions
    .filter((tx) => tx.accountId === accountId && monthKey(tx.date) === targetMonthKey)
    .reduce((sum, tx) => {
      const amount = Number(tx.amount) || 0;
      return sum + (tx.type === "income" ? amount : -amount);
    }, 0);
}

function computeDeferredCardDebit(transactions, cardDebitDates, accountId, targetMonthKey) {
  const accountDebitDates = cardDebitDates?.[accountId] || {};

  return Object.entries(accountDebitDates).reduce((sum, [sourceMonthKey, debitDate]) => {
    if (!debitDate || monthKey(debitDate) !== targetMonthKey || sourceMonthKey === targetMonthKey) {
      return sum;
    }

    const sourceMonthCardTotal = transactions
      .filter((tx) =>
        tx.isCard === true &&
        tx.accountId === accountId &&
        monthKey(tx.date) === sourceMonthKey,
      )
      .reduce((cardSum, tx) => {
        const amount = Number(tx.amount) || 0;
        return cardSum + (tx.type === "expense" ? amount : -amount);
      }, 0);

    return sum + sourceMonthCardTotal;
  }, 0);
}

function computeDisplayBalance(transactions, cardDebitDates, accountId, targetMonthKey) {
  const baseMonthBalance = computeBaseMonthBalance(transactions, accountId, targetMonthKey);
  const deferredCardDebit = computeDeferredCardDebit(
    transactions,
    cardDebitDates,
    accountId,
    targetMonthKey,
  );

  return baseMonthBalance - deferredCardDebit;
}

exports.ajouterTransaction = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Méthode non autorisée");
  }

  const { secret, userId, title, amount, type, accountId, date, note, isCard } = req.body;

  if (secret !== SECRET) {
    return res.status(403).send("Accès refusé");
  }

  if (!userId || !title || !amount || !type || !accountId || !date) {
    return res.status(400).send("Champs manquants");
  }

  if (type !== "expense" && type !== "income") {
    return res.status(400).send("Type invalide");
  }

  try {
    const parsedAmount = parseFloat(String(amount).replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).send("Montant invalide");
    }

    const transaction = {
      id:        genId(),
      title:     title.trim(),
      amount:    parsedAmount,
      type:      type,
      accountId: accountId,
      date:      date,
      note:      note || "",
      isCard:    isCard === true || isCard === "true",
      pointed:   false,
    };

    const budgetRef = admin.firestore()
      .collection("budgets")
      .doc(userId);

    // Ajoute au tableau "transactions" du document
    await budgetRef.update({
        transactions: admin.firestore.FieldValue.arrayUnion(transaction)
    });

    const budgetSnap = await budgetRef.get();
    const transactions = Array.isArray(budgetSnap.get("transactions"))
      ? budgetSnap.get("transactions")
      : [];
    const cardDebitDates = budgetSnap.get("cardDebitDates") || {};
    const transactionMonthKey = monthKey(date);
    const monthBalance = computeDisplayBalance(
      transactions,
      cardDebitDates,
      accountId,
      transactionMonthKey,
    );

    return res.status(200).json({
      success:       true,
      message: `Transaction "${title}" ajoutée avec succès.`,
      transactionId: transaction.id,
      monthKey:      transactionMonthKey,
      balance:       monthBalance,
      accountId:     accountId,
      isCard:        transaction.isCard,
    });

  } catch (error) {
    console.error("Erreur Firestore:", error);
    return res.status(500).send("Erreur serveur");
  }
});
