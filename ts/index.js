var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var openCard = function (form, saveCard) {
    form.style.display = "block";
    saveCard.style.display = "none";
};
var checkOnValue = function (addButton, event) {
    var value = event.target.value;
    if (value) {
        addButton.style.display = "block";
    }
    else {
        addButton.style.display = "none";
    }
};
var closeCard = function (form, addButton, saveCard, textarea) {
    textarea.value = "";
    form.style.display = "none";
    addButton.style.display = "none";
    saveCard.style.display = "flex";
};
var drawCard = function (data, cardItemId) {
    var list = document.querySelector("#".concat(cardItemId, "-item-container"));
    if (!list)
        return;
    list.innerHTML = "";
    data[cardItemId].forEach(function (_a) {
        var id = _a.id, textarea = _a.textarea;
        var todoItemsHTML = "\n        <div class=\"toDo-list-item\" id=\"".concat(id, "\" draggable=\"true\">").concat(textarea, " \n        ").concat(cardItemId === "deleted"
            ? "<img class=\"restore-button\" src=\"./svg/restore-icon.svg\"/></div>"
            : "<img class=\"delete-icon\" src=\"./svg/recycle-bin-icon.svg\"/></div>", "\n        </div>");
        list.insertAdjacentHTML("beforeend", todoItemsHTML);
    });
    if (cardItemId === "deleted") {
        var restoreButtons = list.querySelectorAll(".restore-button");
        restoreButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                var cardIdElement = event.target.closest(".toDo-list-item");
                if (cardIdElement) {
                    var cardId = +cardIdElement.id;
                    restoreCard(data, cardId);
                }
                else {
                    console.log("Drawcard: error cardId");
                }
            });
        });
    }
};
var addNewCard = function (data, textarea, editingCardId, event) {
    event.preventDefault();
    var cardItem = event.target.closest(".card-item");
    if (cardItem) {
        var cardItemId = cardItem.id;
        if (editingCardId[0] === null) {
            data[cardItemId].push({
                id: Date.now(),
                textarea: textarea.value,
            });
        }
        else {
            var cardToUpdate = data[cardItemId].find(function (_a) {
                var id = _a.id;
                return id === editingCardId[0];
            });
            if (cardToUpdate) {
                cardToUpdate.textarea = textarea.value;
            }
            editingCardId[0] = null;
        }
        drawCard(data, cardItemId);
    }
};
var deleteHandler = function (event, data, cardItemId) {
    var cardIdElement = event.target.closest(".toDo-list-item");
    if (cardIdElement) {
        var cardId_1 = +cardIdElement.id;
        var cardIndex = data[cardItemId].findIndex(function (_a) {
            var id = _a.id;
            return id === cardId_1;
        });
        if (cardIndex !== -1) {
            var deletedItem = data[cardItemId].splice(cardIndex, 1)[0];
            data.deleted.push(deletedItem);
            drawCard(data, cardItemId);
            drawCard(data, "deleted");
            saveDataToLocalStorage(data);
        }
    }
    else {
        console.log("Delete Habdler Error");
    }
};
var restoreCard = function (data, cardId) {
    var cardIndex = data.deleted.findIndex(function (_a) {
        var id = _a.id;
        return id === cardId;
    });
    if (cardIndex !== -1) {
        var restoredItem = data.deleted.splice(cardIndex, 1)[0];
        var cardItemId = "toDo";
        data[cardItemId].push(restoredItem);
        drawCard(data, "deleted");
        drawCard(data, cardItemId);
        saveDataToLocalStorage(data);
    }
};
var setEditingCard = function (editingCardId, cardId) {
    editingCardId[0] = cardId;
};
var saveDataToLocalStorage = function (data) {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem("taskData", JSON.stringify(data));
    }
};
var init = function () {
    var data = {
        toDo: [],
        inProgress: [],
        done: [],
        deleted: [],
    };
    if (typeof localStorage !== "undefined") {
        var storedData = localStorage.getItem("taskData");
        if (storedData) {
            data = JSON.parse(storedData);
        }
    }
    drawCard(data, "toDo");
    drawCard(data, "inProgress");
    drawCard(data, "done");
    drawCard(data, "deleted");
    console.log(data);
    var editingCardId = [null];
    //Todo column
    var ToDoform = document.querySelector("#todo-form-card");
    var addToDoButton = document.querySelector("#toDo-add-card");
    var cancelToDoButton = document.querySelector("#toDo-cancel-card");
    var saveToDoCard = document.querySelector("#toDo-add-item");
    var toDoList = document.querySelector("#toDo-list");
    var toDotextarea = document.querySelector("#toDo-textarea");
    ToDoform.style.display = "none";
    addToDoButton.style.display = "none";
    saveToDoCard.style.display = "flex";
    saveToDoCard.addEventListener("click", function () {
        openCard(ToDoform, saveToDoCard);
    });
    toDotextarea.addEventListener("input", function (event) {
        checkOnValue(addToDoButton, event);
    });
    cancelToDoButton.addEventListener("click", function (event) {
        toDotextarea.value = "";
        ToDoform.style.display = "none";
        saveToDoCard.style.display = "flex";
        checkOnValue(addToDoButton, event);
    });
    addToDoButton.addEventListener("click", function (event) {
        event.preventDefault();
        addNewCard(data, toDotextarea, editingCardId, event);
        closeCard(ToDoform, addToDoButton, saveToDoCard, toDotextarea);
        if (typeof localStorage !== "undefined") {
            saveDataToLocalStorage(data);
        }
    });
    toDoList.addEventListener("click", function (event) {
        var target = event.target;
        if (target.classList.contains("delete-icon")) {
            deleteHandler(event, data, "toDo");
            if (typeof localStorage !== "undefined") {
                saveDataToLocalStorage(data);
            }
        }
        if (target.closest(".toDo-list-item")) {
            var cardIdElement = target.closest(".toDo-list-item");
            if (cardIdElement) {
                var cardId_2 = +cardIdElement.id;
                setEditingCard(editingCardId, cardId_2);
                var card = data["toDo"].find(function (_a) {
                    var id = _a.id;
                    return id === cardId_2;
                });
                var isCardOpen = cardIdElement.classList.contains("open");
                if (isCardOpen) {
                    closeCard(ToDoform, addToDoButton, saveToDoCard, toDotextarea);
                    cardIdElement.classList.remove("open");
                }
                else if (card) {
                    toDotextarea.value = card.textarea;
                    openCard(ToDoform, saveToDoCard);
                    cardIdElement.classList.add("open");
                }
            }
        }
    });
    //Inprogress column
    var inProgressForm = document.querySelector("#inProgress-form-card");
    var addInProgressButton = document.querySelector("#inProgress-add-card");
    var cancelInProgressButton = document.querySelector("#inProgress-cancel-card");
    var saveInProgressCard = document.querySelector("#inProgress-add-item");
    var inProgressTextarea = document.querySelector("#inProgress-textarea");
    var InProgressList = document.querySelector("#inProgress-list");
    inProgressForm.style.display = "none";
    addInProgressButton.style.display = "none";
    saveInProgressCard.style.display = "flex";
    saveInProgressCard.addEventListener("click", function () {
        openCard(inProgressForm, saveInProgressCard);
    });
    inProgressTextarea.addEventListener("input", function (event) {
        checkOnValue(addInProgressButton, event);
    });
    cancelInProgressButton.addEventListener("click", function (event) {
        inProgressTextarea.value = "";
        inProgressForm.style.display = "none";
        saveInProgressCard.style.display = "flex";
        checkOnValue(addInProgressButton, event);
    });
    addInProgressButton.addEventListener("click", function (event) {
        event.preventDefault();
        addNewCard(data, inProgressTextarea, editingCardId, event);
        closeCard(inProgressForm, addInProgressButton, saveInProgressCard, inProgressTextarea);
        if (typeof localStorage !== "undefined") {
            saveDataToLocalStorage(data);
        }
    });
    InProgressList.addEventListener("click", function (event) {
        var target = event.target;
        if (target.classList.contains("delete-icon")) {
            deleteHandler(event, data, "inProgress");
            if (typeof localStorage !== "undefined") {
                saveDataToLocalStorage(data);
            }
        }
        if (target.closest(".toDo-list-item")) {
            var cardIdElement = target.closest(".toDo-list-item");
            if (cardIdElement) {
                var cardId_3 = +cardIdElement.id;
                setEditingCard(editingCardId, cardId_3);
                var card = data["inProgress"].find(function (_a) {
                    var id = _a.id;
                    return id === cardId_3;
                });
                var isCardOpen = cardIdElement.classList.contains("open");
                if (isCardOpen) {
                    closeCard(inProgressForm, addInProgressButton, saveInProgressCard, inProgressTextarea);
                    cardIdElement.classList.remove("open");
                }
                else if (card) {
                    inProgressTextarea.value = card.textarea;
                    openCard(inProgressForm, saveInProgressCard);
                    cardIdElement.classList.add("open");
                }
            }
        }
    });
    //done column
    var doneForm = document.querySelector("#done-form-card");
    var addDoneButton = document.querySelector("#done-add-card");
    var cancelDoneButton = document.querySelector("#done-cancel-card");
    var saveDoneCard = document.querySelector("#done-add-item");
    var doneTextarea = document.querySelector("#done-textarea");
    var doneList = document.querySelector("#done-list");
    doneForm.style.display = "none";
    addDoneButton.style.display = "none";
    saveDoneCard.style.display = "flex";
    saveDoneCard.addEventListener("click", function () {
        openCard(doneForm, saveDoneCard);
    });
    doneTextarea.addEventListener("input", function (event) {
        checkOnValue(addDoneButton, event);
    });
    cancelDoneButton.addEventListener("click", function (event) {
        doneTextarea.value = "";
        doneForm.style.display = "none";
        saveDoneCard.style.display = "flex";
        checkOnValue(addDoneButton, event);
    });
    addDoneButton.addEventListener("click", function (event) {
        event.preventDefault();
        addNewCard(data, doneTextarea, editingCardId, event);
        closeCard(doneForm, addDoneButton, saveDoneCard, doneTextarea);
        if (typeof localStorage !== "undefined") {
            saveDataToLocalStorage(data);
        }
    });
    doneList.addEventListener("click", function (event) {
        var target = event.target;
        if (target.classList.contains("delete-icon")) {
            deleteHandler(event, data, "done");
            if (typeof localStorage !== "undefined") {
                saveDataToLocalStorage(data);
            }
        }
        if (target.closest(".toDo-list-item")) {
            var cardIdElement = target.closest(".toDo-list-item");
            if (cardIdElement) {
                var cardId_4 = +cardIdElement.id;
                setEditingCard(editingCardId, cardId_4);
                var card = data["done"].find(function (_a) {
                    var id = _a.id;
                    return id === cardId_4;
                });
                var isCardOpen = cardIdElement.classList.contains("open");
                if (isCardOpen) {
                    closeCard(doneForm, addDoneButton, saveDoneCard, doneTextarea);
                    cardIdElement.classList.remove("open");
                }
                else if (card) {
                    doneTextarea.value = card.textarea;
                    openCard(doneForm, saveDoneCard);
                    cardIdElement.classList.add("open");
                }
            }
        }
    });
    //delete column
    var deletedList = document.querySelector("#deleted-list");
    // deletedForm.style.display = "none";
    deletedList.addEventListener("click", function (event) {
        var target = event.target;
        if (target.classList.contains("restore-button")) {
            deleteHandler(event, data, "deleted");
            if (typeof localStorage !== "undefined") {
                saveDataToLocalStorage(data);
            }
        }
    });
    //drap and drop
    var itemContainers = __spreadArray([], document.querySelectorAll(".toDo-list"), true);
    itemContainers.forEach(function (container) {
        container.addEventListener("dragstart", function (event) {
            var _a;
            var dragEvent = event;
            (_a = dragEvent.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", dragEvent.target.id);
            dragEvent.target.classList.add("dragged");
            setTimeout(function () {
                dragEvent.target.classList.remove("dragged");
            }, 100);
        });
        container.addEventListener("dragover", function (event) {
            event.preventDefault();
            container.classList.add("dragover");
        });
        container.addEventListener("dragleave", function () {
            container.classList.remove("dragover");
        });
        container.addEventListener("drop", function (event) {
            var _a;
            event.preventDefault();
            var cardId = event;
            var draggedCardId = (_a = cardId.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
            if (draggedCardId) {
                var draggedCard = document.getElementById(draggedCardId);
                if (draggedCard && draggedCard.parentNode instanceof HTMLElement) {
                    var targetCardItemId = container.id.split("-")[0];
                    var sourceCardItemId = draggedCard.parentNode.id.split("-")[0];
                    var cardIndex = data[sourceCardItemId].findIndex(function (_a) {
                        var id = _a.id;
                        return id === +draggedCardId;
                    });
                    var card = data[sourceCardItemId][cardIndex];
                    data[sourceCardItemId].splice(cardIndex, 1);
                    data[targetCardItemId].push(card);
                    drawCard(data, sourceCardItemId);
                    drawCard(data, targetCardItemId);
                    saveDataToLocalStorage(data);
                    container.classList.remove("dragover");
                }
            }
        });
    });
};
init();
