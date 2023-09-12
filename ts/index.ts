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

const drawCard = (data: TaskData, cardItemId: keyof TaskData): void => {
  const list: Element | null = document.querySelector(
    `#${cardItemId}-item-container`
  );
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
): void => {
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
): void => {
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

const restoreCard = (data: TaskData, cardId: number): void => {
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

const setEditingCard = (
  editingCardId: (number | null)[],
  cardId: number
): void => {
  editingCardId[0] = cardId;
};

const saveDataToLocalStorage = (data: TaskData): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("taskData", JSON.stringify(data));
  }
};

const init = (): void => {
  let data: TaskData = {
    toDo: [],
    inProgress: [],
    done: [],
    deleted: [],
  };

  if (typeof localStorage !== "undefined") {
    const storedData = localStorage.getItem("taskData");

    if (storedData) {
      data = JSON.parse(storedData);
    }
  }

  drawCard(data, "toDo");
  drawCard(data, "inProgress");
  drawCard(data, "done");
  drawCard(data, "deleted");

  console.log(data);
  const editingCardId: (number | null)[] = [null];
  //Todo column
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

    if (typeof localStorage !== "undefined") {
      saveDataToLocalStorage(data);
    }
  });

  toDoList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("delete-icon")) {
      deleteHandler(event, data, "toDo");

      if (typeof localStorage !== "undefined") {
        saveDataToLocalStorage(data);
      }
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

  //Inprogress column
  const inProgressForm = document.querySelector(
    "#inProgress-form-card"
  ) as HTMLDivElement;
  const addInProgressButton = document.querySelector(
    "#inProgress-add-card"
  ) as HTMLButtonElement;
  const cancelInProgressButton = document.querySelector(
    "#inProgress-cancel-card"
  ) as HTMLButtonElement;
  const saveInProgressCard = document.querySelector(
    "#inProgress-add-item"
  ) as HTMLButtonElement;
  const inProgressTextarea = document.querySelector(
    "#inProgress-textarea"
  ) as HTMLTextAreaElement;
  const InProgressList = document.querySelector(
    "#inProgress-list"
  ) as HTMLUListElement;

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
    addNewCard(data, inProgressTextarea, editingCardId, event);
    closeCard(
      inProgressForm,
      addInProgressButton,
      saveInProgressCard,
      inProgressTextarea
    );

    if (typeof localStorage !== "undefined") {
      saveDataToLocalStorage(data);
    }
  });

  InProgressList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("delete-icon")) {
      deleteHandler(event, data, "inProgress");

      if (typeof localStorage !== "undefined") {
        saveDataToLocalStorage(data);
      }
    }

    if (target.closest(".toDo-list-item")) {
      const cardIdElement = target.closest(".toDo-list-item");
      if (cardIdElement) {
        const cardId = +cardIdElement.id;
        setEditingCard(editingCardId, cardId);

        const card = data["inProgress"].find(({ id }) => id === cardId);
        const isCardOpen = cardIdElement.classList.contains("open");
        if (isCardOpen) {
          closeCard(
            inProgressForm,
            addInProgressButton,
            saveInProgressCard,
            inProgressTextarea
          );
          cardIdElement.classList.remove("open");
        } else if (card) {
          inProgressTextarea.value = card.textarea;
          openCard(inProgressForm, saveInProgressCard);
          cardIdElement.classList.add("open");
        }
      }
    }
  });

  //done column
  const doneForm = document.querySelector("#done-form-card") as HTMLDivElement;
  const addDoneButton = document.querySelector(
    "#done-add-card"
  ) as HTMLButtonElement;
  const cancelDoneButton = document.querySelector(
    "#done-cancel-card"
  ) as HTMLButtonElement;
  const saveDoneCard = document.querySelector(
    "#done-add-item"
  ) as HTMLButtonElement;
  const doneTextarea = document.querySelector(
    "#done-textarea"
  ) as HTMLTextAreaElement;
  const doneList = document.querySelector("#done-list") as HTMLUListElement;

  doneForm.style.display = "none";
  addDoneButton.style.display = "none";
  saveDoneCard.style.display = "flex";

  saveDoneCard.addEventListener("click", () => {
    openCard(doneForm, saveDoneCard);
  });

  doneTextarea.addEventListener("input", (event) => {
    checkOnValue(addDoneButton, event);
  });

  cancelDoneButton.addEventListener("click", (event) => {
    doneTextarea.value = "";
    doneForm.style.display = "none";
    saveDoneCard.style.display = "flex";
    checkOnValue(addDoneButton, event);
  });

  addDoneButton.addEventListener("click", (event) => {
    event.preventDefault();
    addNewCard(data, doneTextarea, editingCardId, event);
    closeCard(doneForm, addDoneButton, saveDoneCard, doneTextarea);

    if (typeof localStorage !== "undefined") {
      saveDataToLocalStorage(data);
    }
  });

  doneList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("delete-icon")) {
      deleteHandler(event, data, "done");

      if (typeof localStorage !== "undefined") {
        saveDataToLocalStorage(data);
      }
    }

    if (target.closest(".toDo-list-item")) {
      const cardIdElement = target.closest(".toDo-list-item");
      if (cardIdElement) {
        const cardId = +cardIdElement.id;
        setEditingCard(editingCardId, cardId);

        const card = data["done"].find(({ id }) => id === cardId);
        const isCardOpen = cardIdElement.classList.contains("open");
        if (isCardOpen) {
          closeCard(doneForm, addDoneButton, saveDoneCard, doneTextarea);
          cardIdElement.classList.remove("open");
        } else if (card) {
          doneTextarea.value = card.textarea;
          openCard(doneForm, saveDoneCard);
          cardIdElement.classList.add("open");
        }
      }
    }
  });
  //delete column
  const deletedList = document.querySelector(
    "#deleted-list"
  ) as HTMLUListElement;

  // deletedForm.style.display = "none";
deletedList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("restore-button")) {
      deleteHandler(event, data, "deleted");

      if (typeof localStorage !== "undefined") {
        saveDataToLocalStorage(data);
      }
    }
  });
  //drap and drop
  const itemContainers: Element[] = [
    ...document.querySelectorAll(".toDo-list"),
  ];
  itemContainers.forEach((container) => {
    container.addEventListener("dragstart", (event) => {
      const dragEvent = event as DragEvent;
      dragEvent.dataTransfer?.setData(
        "text/plain",
        (dragEvent.target as HTMLElement).id
      );
      (dragEvent.target as HTMLElement).classList.add("dragged");

      setTimeout(() => {
        (dragEvent.target as HTMLElement).classList.remove("dragged");
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
      const cardId = event as DragEvent;
      const draggedCardId: string | undefined =
        cardId.dataTransfer?.getData("text/plain");
      if (draggedCardId) {
        const draggedCard = document.getElementById(draggedCardId);

        if (draggedCard && draggedCard.parentNode instanceof HTMLElement) {
          const targetCardItemId = container.id.split("-")[0];
          const sourceCardItemId = draggedCard.parentNode.id.split("-")[0];

          const cardIndex = (
            data[sourceCardItemId as keyof TaskData] as Task[]
          ).findIndex(({ id }) => id === +draggedCardId);
          const card = (data[sourceCardItemId as keyof TaskData] as Task[])[
            cardIndex
          ];

          (data[sourceCardItemId as keyof TaskData] as Task[]).splice(
            cardIndex,
            1
          );
          (data[targetCardItemId as keyof TaskData] as Task[]).push(card);

          drawCard(data, sourceCardItemId as keyof TaskData);
          drawCard(data, targetCardItemId as keyof TaskData);
          saveDataToLocalStorage(data);

          container.classList.remove("dragover");
        }
      }
    });
  });
};

init();
