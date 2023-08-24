const openCard = (form, addCardPlus) => {
  form.style.display = "block";
  addCardPlus.style.display = "none";
};

const checkOnValue = (addCardButton, event) => {
  const value = event.target.value;
  if (value) {
    addCardButton.style.display = "block";
  } else {
    addCardButton.style.display = "none";
  }
};

const closeCard = (form, addCardButton, addCardPlus, textarea) => {
  textarea.value = "";
  form.style.display = "none";
  addCardButton.style.display = "none";
  addCardPlus.style.display = "flex";
};

const drawCard = (data) => {
  const toDoList = document.querySelector(".item-container");
  let todoItemsHTML = "";

  data.forEach(({ id, textarea }) => {
    todoItemsHTML += `
      <div class="toDo-list-item" id="${id}">${textarea} 
      <img class="delete-icon" src="./svg/recycle-bin-icon.svg"/></div>
    `;
  });

  toDoList.innerHTML = todoItemsHTML;
};

const addNewCard = (data, textarea) => {
  if (editingCardId === null) {
    data.push({
      id: Date.now(),
      textarea: textarea.value,
    });
  } else {
    const cardToUpdate = data.find(({ id }) => id === editingCardId);
    if (cardToUpdate) {
      cardToUpdate.textarea = textarea.value;
    }
    editingCardId = null;
  }

  drawCard(data);
};

const deleteHandler = (event, data) => {
  const cardId = +event.target.closest(".toDo-list-item").id;
  const cardIndex = data.findIndex(({ id }) => id === cardId);

  data.splice(cardIndex, 1);
  drawCard(data);
};

const setEditingCard = (cardId) => {
  editingCardId = cardId;
};

const saveCard = (data, textarea) => {
  if (editingCardId) {
    const cardIndex = data.findIndex(({ id }) => id === editingCardId);
    if (cardIndex !== -1) {
      data[cardIndex].textarea = textarea.value;
    }
    editingCardId = null;
    drawCard(data);
  }
};

let editingCardId = null;

const init = () => {
  let data = [];

  console.log(data);

  const form = document.querySelector(".form-card");
  const addCardButton = document.querySelector(".add-card");
  const cancelButton = document.querySelector(".cancel-card");
  const addCardPlus = document.querySelector(".add-item");
  const textarea = document.querySelector(".textarea");
  const toDoList = document.querySelector("#toDo-list");

  form.style.display = "none";
  addCardButton.style.display = "none";
  addCardPlus.style.display = "flex";

  addCardPlus.addEventListener("click", () => {
    openCard(form, addCardPlus);
  });

  textarea.addEventListener("input", (event) => {
    checkOnValue(addCardButton, event);
  });

  cancelButton.addEventListener("click", (event) => {
    textarea.value = "";
    form.style.display = "none";
    addCardPlus.style.display = "flex";
    checkOnValue(addCardButton, event);
  });

  addCardButton.addEventListener("click", (event) => {
    event.preventDefault();
    addNewCard(data, textarea);
    closeCard(form, addCardButton, addCardPlus, textarea);
  });

  toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-icon")) {
      deleteHandler(event, data);
    }

    if (event.target.closest(".toDo-list-item")) {
      const cardId = +event.target.closest(".toDo-list-item").id;
      const card = data.find(({ id }) => id === cardId);

      const isCardOpen = event.target
        .closest(".toDo-list-item")
        .classList.contains("open");
      if (isCardOpen) {
        closeCard(form, addCardButton, addCardPlus, textarea);
        event.target.closest(".toDo-list-item").classList.remove("open");
      } else if (card) {
        setEditingCard(cardId);
        textarea.value = card.textarea;
        openCard(form, addCardPlus);
        event.target.closest(".toDo-list-item").classList.add("open");
      }
    }
  });

  drawCard(data);
};

init();

//const addTask = (id, data) => {
//   data[id].push({
//     id: Date.now(),
//     title: "title",
//   });
// };
// toDo.addEventListener("click", (event) => {
//   event.preventDefault();

//   addTask("todo", data);
//   data.todo.push({
//     id: Date.now(),
//     title: "title",
//   });
//   addNewCard(data, textarea);
// });
// inProgress.addEventListener("click", (event) => {
//   event.preventDefault();

//   addTask("inProgress", data);

//   data.inProgress.push({
//     id: Date.now(),
//     title: "title",
//   });
// });
// done.addEventListener("click", (event) => {
//   event.preventDefault();

//   addTask("done", data);

//   data.done.push({
//     id: Date.now(),
//     title: "title",
//   });
// });
// deleted.addEventListener("click", (event) => {
//   event.preventDefault();

//   addTask("deleted", data);

//   deleted.todo.push({
//     id: Date.now(),
//     title: "title",
//   });
// });

// let data = {
//   todo: [],
//   inProgress: [],
//   done: [],
//   deleted: [],
// };
