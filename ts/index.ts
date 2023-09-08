interface Task {
  id: number;
  textarea: string;
}
interface TaskData {
  toDo: Task[];
  inProgress: Task[];
  done: Task[];
  deleted: Task[];
}

const openCard = (form: HTMLDivElement, saveCard: HTMLButtonElement) => {
  form.style.display = "block";
  saveCard.style.display = "none";
};

const checkOnValue = (addButton: HTMLButtonElement, event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  if (value) {
    addButton.style.display = "block";
  } else {
    addButton.style.display = "none";
  }
};

const closeCard = (
  form: HTMLDivElement,
  addButton: HTMLButtonElement,
  saveCard: HTMLButtonElement,
  textarea: HTMLTextAreaElement
) => {
  textarea.value = "";
  form.style.display = "none";
  addButton.style.display = "none";
  saveCard.style.display = "flex";
};

const drawCard = (data: TaskData, cardItemId: keyof TaskData) => {
  const list = document.querySelector(`#${cardItemId}-item-container`);
  if (!list) return;
  list.innerHTML = "";

  data[cardItemId].forEach(({ id, textarea }) => {
    const todoItemsHTML = `
        <div class="toDo-list-item" id="${id}" draggable="true">${textarea} 
        ${
          cardItemId === "deleted"
            ? `<img class="restore-button" src="./svg/restore-icon.svg"/></div>`
            : `<img class="delete-icon" src="./svg/recycle-bin-icon.svg"/></div>`
        }
        </div>`;
    list.insertAdjacentHTML("beforeend", todoItemsHTML);
  });
  if (cardItemId === "deleted") {
    const restoreButtons = list.querySelectorAll(".restore-button");
    restoreButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const cardIdElement = (event.target as HTMLElement).closest(
          ".toDo-list-item"
        );
        if (cardIdElement) {
          const cardId = +cardIdElement.id;
          restoreCard(data, cardId);
        } else {
          console.log("Drawcard: error cardId");
        }
      });
    });
  }
};

const addNewCard = (
  data: TaskData,
  textarea: HTMLTextAreaElement,
  editingCardId: (number | null)[],
  event: Event
) => {
  event.preventDefault();
  const cardItem = (event.target as HTMLTextAreaElement).closest(".card-item");
  if (cardItem) {
    const cardItemId = cardItem.id as keyof TaskData;
    if (editingCardId[0] === null) {
      data[cardItemId].push({
        id: Date.now(),
        textarea: textarea.value,
      });
    } else {
      const cardToUpdate = data[cardItemId].find(
        ({ id }) => id === editingCardId[0]
      );
      if (cardToUpdate) {
        cardToUpdate.textarea = textarea.value;
      }
      editingCardId[0] = null;
    }

    drawCard(data, cardItemId);
  }
};

const deleteHandler = (
  event: Event,
  data: TaskData,
  cardItemId: keyof TaskData
) => {
  const cardIdElement = (event.target as HTMLElement).closest(
    ".toDo-list-item"
  );
  if (cardIdElement) {
    const cardId = +cardIdElement.id;
    const cardIndex = data[cardItemId].findIndex(({ id }) => id === cardId);

    if (cardIndex !== -1) {
      const deletedItem = data[cardItemId].splice(cardIndex, 1)[0];
      data.deleted.push(deletedItem);
      drawCard(data, cardItemId);
      drawCard(data, "deleted");
      saveDataToLocalStorage(data);
    }
  } else {
    console.log("Delete Habdler Error");
  }
};

const restoreCard = (data: TaskData, cardId: number) => {
  const cardIndex = data.deleted.findIndex(({ id }) => id === cardId);

  if (cardIndex !== -1) {
    const restoredItem = data.deleted.splice(cardIndex, 1)[0];
    const cardItemId: keyof TaskData = "toDo";
    data[cardItemId].push(restoredItem);
    drawCard(data, "deleted");
    drawCard(data, cardItemId);
    saveDataToLocalStorage(data);
  }
};

const setEditingCard = (editingCardId: (number | null)[], cardId: number) => {
  editingCardId[0] = cardId;
};

const saveDataToLocalStorage = (data: TaskData) => {
  localStorage.setItem("taskData", JSON.stringify(data));
};

const init = () => {
  const storedData = localStorage.getItem("taskData");

  let data: TaskData;

  if (storedData) {
    data = JSON.parse(storedData);
  } else {
    data = {
      toDo: [],
      inProgress: [],
      done: [],
      deleted: [],
    };
  }

  drawCard(data, "toDo");
  drawCard(data, "inProgress");
  drawCard(data, "done");
  drawCard(data, "deleted");

  console.log(data);
  const editingCardId: (number | null)[] = [null];

  const ToDoform = document.querySelector("#todo-form-card") as HTMLDivElement;
  const addToDoButton = document.querySelector(
    "#toDo-add-card"
  ) as HTMLButtonElement;
  const cancelToDoButton = document.querySelector(
    "#toDo-cancel-card"
  ) as HTMLButtonElement;
  const saveToDoCard = document.querySelector(
    "#toDo-add-item"
  ) as HTMLButtonElement;
  const toDoList = document.querySelector("#toDo-list") as HTMLUListElement;
  const toDotextarea = document.querySelector(
    "#toDo-textarea"
  ) as HTMLTextAreaElement;

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
    addNewCard(data, toDotextarea, editingCardId, event);
    closeCard(ToDoform, addToDoButton, saveToDoCard, toDotextarea);
    saveDataToLocalStorage(data);
  });

  toDoList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("delete-icon")) {
      deleteHandler(event, data, "toDo");
      saveDataToLocalStorage(data);
    }

    if (target.closest(".toDo-list-item")) {
      const cardIdElement = target.closest(".toDo-list-item");
      if (cardIdElement) {
        const cardId = +cardIdElement.id;
        setEditingCard(editingCardId, cardId);

        const card = data["toDo"].find(({ id }) => id === cardId);
        const isCardOpen = cardIdElement.classList.contains("open");
        if (isCardOpen) {
          closeCard(ToDoform, addToDoButton, saveToDoCard, toDotextarea);
          cardIdElement.classList.remove("open");
        } else if (card) {
          toDotextarea.value = card.textarea;
          openCard(ToDoform, saveToDoCard);
          cardIdElement.classList.add("open");
        }
      }
    }
  });
};

init();
