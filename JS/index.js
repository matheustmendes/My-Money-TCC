// Dialog

const button = document.querySelector(".dialog-open");
const dialog = document.querySelector("#dialog");
const buttonClose = document.querySelector(".button.cancel");

button.onclick = () => {
  dialog.showModal();
};

buttonClose.onclick = () => {
  dialog.close();
};

// ================================================================== //

// Armazenamento das receitas

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("my.money:transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem("my.money:transactions", JSON.stringify(transactions));
  },
};

// =========================================================== //


// Lógica das receitas (adicionar, remover, etc)

const Transactions = {
  all: Storage.get(),
// Adicionar Receitas
  add(transaction) {
    Transactions.all.push(transaction);
    App.reload();
  },
// Remover Receitas
  remove(index) {
    Transactions.all.splice(index, 1);

    App.reload();
  },
// Entradas positivas
  incomes() {
    let income = 0;
    Transactions.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },
// Entradas Negativas
  expenses() {
    let expense = 0;
    Transactions.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },
// Total de entradas
  total() {
    return Transactions.incomes() + Transactions.expenses();
  },
};
// ================================================================= //

// DOM (adição ao HTML)
const DomHTML = {
  transactionContainer: document.querySelector("#table-data tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DomHTML.innerHTMLTransaction(transaction);
    tr.dataset.index = index;
    DomHTML.transactionContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const expenseOrIncome = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
        <tr>
        <td class="description">${transaction.description}</td>
  
        <td class="option">${transaction.option}</td>
        
        <td class="${expenseOrIncome}">${amount}</td>
        
        <td class="date">${transaction.date}</td>
        <td>
             <img onclick="Transactions.remove(${index})" src="./Img/minus.svg" alt="Remover transação">
          </td>
        </tr>
      `;

    return html;
  },
// Atualizar no HTML
  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transactions.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transactions.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transactions.total()
    );
  },

  clearTransactions() {
    DomHTML.transactionContainer.innerHTML = "";
  },
};

// ================================================================ //

// Funcionalidades Coadjuvantes da Aplicação
const Utils = {
  // Formatação do valor
  formatAmount(value) {
    value = value * 100;
    return Math.round(value);
  },
  // Formatação de data
  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  // Formatação da moeda para BRL (Brazilian Real)
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};
 //==================================================================//


// Formulário de adicionar receita
const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  option: document.querySelector("select#categories"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
      option: Form.option.value,
    };
  },

  validateFields() {
    const { description, amount, date, option } = Form.getValues();
    if (
      option.trim() === "" ||
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date, option } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    return {
      description,
      amount,
      date,
      option,
    };
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();
    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transactions.add(transaction);
      Form.clearFields();
      dialog.close();
    } catch (error) {
      alert(error.message);
    }
  },
};
// ================================================================= //

// Coração da aplicação
const App = {
  init() {
    Transactions.all.forEach(DomHTML.addTransaction);
    DomHTML.updateBalance();

    Storage.set(Transactions.all);
  },
  reload() {
    DomHTML.clearTransactions();
    App.init();
  },
};

App.init();


