const openCard = (form, saveCard) => {
  form.style.display = "block";
  saveCard.style.display = "none";
};

const checkOnValue = (addButton, event) => {
  const value = event.target.value;
  if (value) {
    addButton.style.display = "block";
  } else {
    addButton.style.display = "none";
  }
};

const closeCard = (form, addButton, saveCard, textarea) => {
  textarea.value = "";
  form.style.display = "none";
  addButton.style.display = "none";
  saveCard.style.display = "flex";
};



const drawCard = (data, cardItemId) => {
  const list = document.querySelector(`#${cardItemId}-item-container`);
  list.innerHTML = "";

  data[cardItemId].forEach(({ id, textarea }) => {
    const todoItemsHTML = `
      <div class="toDo-list-item" id="${id}" draggable="true">${textarea} 
      ${
        cardItemId === "deleted"
          ?`<img class="restore-button" src="./svg/restore-icon.svg"/></div>`
          : `<img class="delete-icon" src="./svg/recycle-bin-icon.svg"/></div>`
      }
      </div>`;
    list.insertAdjacentHTML("beforeend", todoItemsHTML);
  });
  if (cardItemId === "deleted") {
    const restoreButtons = list.querySelectorAll(".restore-button");
    restoreButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const cardId = +event.target.closest(".toDo-list-item").id;
        restoreCard(data, cardId);
      });
    });
  }
};

const addNewCard = (data, textarea, event) => {
  event.preventDefault();
  const cardItem = event.target.closest(".card-item");
  const cardItemId = cardItem.id;
  if (editingCardId === null) {
    data[cardItemId].push({
      id: Date.now(),
      textarea: textarea.value,
    });
  } else {
    const cardToUpdate = data[cardItemId].find(
      ({ id }) => id === editingCardId
    );
    if (cardToUpdate) {
      cardToUpdate.textarea = textarea.value;
    }
    editingCardId = null;
  }

  drawCard(data, cardItemId);
};

const deleteHandler = (event, data, cardItemId) => {
  const cardId = +event.target.closest(".toDo-list-item").id;
  const cardIndex = data[cardItemId].findIndex(({ id }) => id === cardId);

  if (cardIndex !== -1) {
    const deletedItem = data[cardItemId].splice(cardIndex, 1)[0];
    data.deleted.push(deletedItem);
    drawCard(data, cardItemId);
    drawCard(data, "deleted");
    saveDataToLocalStorage(data);
  }
};

const restoreCard = (data, cardId) => {
  const cardIndex = data.deleted.findIndex(({ id }) => id === cardId);

  if (cardIndex !== -1) {
    const restoredItem = data.deleted.splice(cardIndex, 1)[0];
    const cardItemId = "toDo";
    data[cardItemId].push(restoredItem);
    drawCard(data, "deleted");
    drawCard(data, cardItemId);
    saveDataToLocalStorage(data);
  }
};

const setEditingCard = (cardId) => {
  editingCardId = cardId;
};

const saveCard = (data, cardItemId, textarea) => {
  if (editingCardId) {
    const cardIndex = data[cardItemId].findIndex(
      ({ id }) => id === editingCardId
    );
    if (cardIndex !== -1) {
      data[cardItemId][cardIndex].textarea = textarea.value;
    }
    editingCardId = null;
    drawCard(data, cardItemId);
  }
};

const saveDataToLocalStorage = (data) => {
  localStorage.setItem("taskData", JSON.stringify(data));
};

let editingCardId = null;

const init = () => {
  let data = JSON.parse(localStorage.getItem("taskData")) || {
    toDo: [],
    inProgress: [],
    done: [],
    deleted: [],
  };

  drawCard(data, "toDo");
  drawCard(data, "inProgress");
  drawCard(data, "done");
  drawCard(data, "deleted");

  console.log(data);

  //Todo col
  const ToDoform = document.querySelector("#todo-form-card");
  const addToDoButton = document.querySelector("#toDo-add-card");
  const cancelToDoButton = document.querySelector("#toDo-cancel-card");
  const saveToDoCard = document.querySelector("#toDo-add-item");
  const toDoList = document.querySelector("#toDo-list");
  const toDotextarea = document.querySelector("#toDo-textarea");

  ToDoform.style.display = "none";
  addToDoButton.style.display = "none";
  saveToDoCard.style.display = "flex";

  saveToDoCard.addEventListener("click", () => {
    openCard(ToDoform, saveToDoCard);
  });

  toDotextarea.addEventListener("input", (event) => {
    checkOnValue(addToDoButton, event);
  });

  cancelToDoButton.addEventListener("click", (event) => {
    toDotextarea.value = "";
    ToDoform.style.display = "none";
    saveToDoCard.style.display = "flex";
    checkOnValue(addToDoButton, event);
  });

  addToDoButton.addEventListener("click", (event) => {
    event.preventDefault();
    addNewCard(data, toDotextarea, event, "toDo");
    closeCard(ToDoform, addToDoButton, saveToDoCard, toDotextarea);
    saveDataToLocalStorage(data);
  });

  toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-icon")) {
      deleteHandler(event, data, "toDo");
      saveDataToLocalStorage(data);
    }
    if (event.target.closest(".toDo-list-item")) {
      const cardId = +event.target.closest(".toDo-list-item").id;
      const card = data["toDo"].find(({ id }) => id === cardId);

      const isCardOpen = event.target
        .closest(".toDo-list-item")
        .classList.contains("open");
      if (isCardOpen) {
        closeCard(ToDoform, addToDoButton, saveToDoCard, toDotextarea);
        event.target.closest(".toDo-list-item").classList.remove("open");
      } else if (card) {
        setEditingCard(cardId);
        toDotextarea.value = card.textarea;
        openCard(ToDoform, saveToDoCard);
        event.target.closest(".toDo-list-item").classList.add("open");
      }
    }
  });

  //InProgress col
  const inProgressForm = document.querySelector("#inProgress-form-card");
  const addInProgressButton = document.querySelector("#inProgress-add-card");
  const cancelInProgressButton = document.querySelector(
    "#inProgress-cancel-card"
  );
  const saveInProgressCard = document.querySelector("#inProgress-add-item");
  const inProgressTextarea = document.querySelector("#inProgress-textarea");
  const InProgressList = document.querySelector("#inProgress-list");

  inProgressForm.style.display = "none";
  addInProgressButton.style.display = "none";
  saveInProgressCard.style.display = "flex";

  saveInProgressCard.addEventListener("click", () => {
    openCard(inProgressForm, saveInProgressCard);
  });

  inProgressTextarea.addEventListener("input", (event) => {
    checkOnValue(addInProgressButton, event);
  });

  cancelInProgressButton.addEventListener("click", (event) => {
    inProgressTextarea.value = "";
    inProgressForm.style.display = "none";
    saveInProgressCard.style.display = "flex";
    checkOnValue(addInProgressButton, event);
  });

  addInProgressButton.addEventListener("click", (event) => {
    event.preventDefault();
    addNewCard(data, inProgressTextarea, event, "inProgress");
    closeCard(
      inProgressForm,
      addInProgressButton,
      saveInProgressCard,
      inProgressTextarea
    );
    saveDataToLocalStorage(data);
  });

  InProgressList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-icon")) {
      deleteHandler(event, data, "inProgress");
      saveDataToLocalStorage(data);
    }
    if (event.target.closest(".toDo-list-item")) {
      const cardId = +event.target.closest(".toDo-list-item").id;
      const card = data["inProgress"].find(({ id }) => id === cardId);

      const isCardOpen = event.target
        .closest(".toDo-list-item")
        .classList.contains("open");
      if (isCardOpen) {
        closeCard(
          inProgressForm,
          addInProgressButton,
          saveInProgressCard,
          inProgressTextarea
        );
        event.target.closest(".toDo-list-item").classList.remove("open");
      } else if (card) {
        setEditingCard(cardId);
        inProgressTextarea.value = card.textarea;
        openCard(inProgressForm, saveInProgressCard);
        event.target.closest(".toDo-list-item").classList.add("open");
      }
    }
  });

  //Done col
  const doneForm = document.querySelector("#done-form-card");
  const addDoneButton = document.querySelector("#done-add-card");
  const cancelDoneButton = document.querySelector("#done-cancel-card");
  const saveDoneCard = document.querySelector("#done-add-item");
  const doneTextarea = document.querySelector("#done-textarea");
  const doneList = document.querySelector("#done-list");

  doneForm.style.display = "none";
  addDoneButton.style.display = "none";
  saveDoneCard.style.display = "flex";

  saveDoneCard.addEventListener("click", () => {
    openCard(doneForm, saveDoneCard);
  });

  doneTextarea.addEventListener("input", (event) => {
    checkOnValue(addDoneButton, event, doneTextarea);
  });

  cancelDoneButton.addEventListener("click", (event) => {
    doneTextarea.value = "";
    doneForm.style.display = "none";
    saveDoneCard.style.display = "flex";
    checkOnValue(addDoneButton, event);
  });

  addDoneButton.addEventListener("click", (event) => {
    event.preventDefault();
    addNewCard(data, doneTextarea, event, "done");
    closeCard(doneForm, addDoneButton, saveDoneCard, doneTextarea);
    saveDataToLocalStorage(data);
  });

  doneList.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-icon")) {
      deleteHandler(event, data, "done");
      saveDataToLocalStorage(data);
    }
    if (event.target.closest(".toDo-list-item")) {
      const cardId = +event.target.closest(".toDo-list-item").id;
      const card = data["done"].find(({ id }) => id === cardId);

      const isCardOpen = event.target
        .closest(".toDo-list-item")
        .classList.contains("open");
      if (isCardOpen) {
        closeCard(doneForm, addDoneButton, saveDoneCard, doneTextarea);
        event.target.closest(".toDo-list-item").classList.remove("open");
      } else if (card) {
        setEditingCard(cardId);
        doneTextarea.value = card.textarea;
        openCard(doneForm, saveDoneCard);
        event.target.closest(".toDo-list-item").classList.add("open");
      }
    }
  });
  //Deleted col
  const deletedForm = document.querySelector("#deleted-form-card");
  const addDeletedButton = document.querySelector("#deleted-add-card");
  const cancelDeletedButton = document.querySelector("#deleted-cancel-card");
  const saveDeletedCard = document.querySelector("#deleted-add-item");
  const deletedTextarea = document.querySelector("#deleted-textarea");
  const deletedList = document.querySelector("#deleted-list");

  deletedForm.style.display = "none";
  addDeletedButton.style.display = "none";
  saveDeletedCard.style.display = "flex";

  saveDeletedCard.addEventListener("click", () => {
    openCard(deletedForm, saveDeletedCard);
  });

  deletedTextarea.addEventListener("input", (event) => {
    checkOnValue(addDeletedButton, event, deletedTextarea);
  });

  cancelDeletedButton.addEventListener("click", (event) => {
    deletedTextarea.value = "";
    deletedForm.style.display = "none";
    saveDeletedCard.style.display = "flex";
    checkOnValue(addDeletedButton, event);
  });

  addDeletedButton.addEventListener("click", (event) => {
    event.preventDefault();
    addNewCard(data, deletedTextarea, event, "deleted");
    closeCard(deletedForm, addDeletedButton, saveDeletedCard, deletedTextarea);
    saveDataToLocalStorage(data);
  });

  deletedList.addEventListener("click", (event) => {
    if (event.target.classList.contains("restore-button")) {
      const cardId = +event.target.closest(".toDo-list-item").id;
      restoreCard(data, cardId);
      saveDataToLocalStorage(data);
    }
    if (event.target.closest(".toDo-list-item")) {
      const cardId = +event.target.closest(".toDo-list-item").id;
      const card = data["deleted"].find(({ id }) => id === cardId);

      const isCardOpen = event.target
        .closest(".toDo-list-item")
        .classList.contains("open");
      if (isCardOpen) {
        closeCard(
          deletedForm,
          addDeletedButton,
          saveDeletedCard,
          deletedTextarea
        );
        event.target.closest(".toDo-list-item").classList.remove("open");
      } else if (card) {
        setEditingCard(cardId);
        deletedTextarea.value = card.textarea;
        openCard(deletedForm, saveDeletedCard);
        event.target.closest(".toDo-list-item").classList.add("open");
      }
    }
  });
  //drag and drop
  const itemContainers = document.querySelectorAll(".toDo-list");

  itemContainers.forEach((container) => {
    container.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", event.target.id);
      event.target.classList.add("dragged");

      setTimeout(() => {
        event.target.classList.remove("dragged");
      }, 100);
    });

    container.addEventListener("dragover", (event) => {
      event.preventDefault();
      container.classList.add("dragover");
    });

    container.addEventListener("dragleave", () => {
      container.classList.remove("dragover");
    });

    container.addEventListener("drop", (event) => {
      event.preventDefault();
      const cardId = event.dataTransfer.getData("text/plain");
      const draggedCard = document.getElementById(cardId);

      const targetCardItemId = container.id.split("-")[0];
      const sourceCardItemId = draggedCard.parentNode.id.split("-")[0];

      const cardIndex = data[sourceCardItemId].findIndex(
        ({ id }) => id === +cardId
      );
      const card = data[sourceCardItemId][cardIndex];

      data[sourceCardItemId].splice(cardIndex, 1);
      data[targetCardItemId].push(card);

      drawCard(data, sourceCardItemId);
      drawCard(data, targetCardItemId);
      saveDataToLocalStorage(data);

      container.classList.remove("dragover");
    });
  });
};

init();

