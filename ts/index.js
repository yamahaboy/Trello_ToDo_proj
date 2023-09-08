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
    localStorage.setItem("taskData", JSON.stringify(data));
};
var init = function () {
    var storedData = localStorage.getItem("taskData");
    var data;
    if (storedData) {
        data = JSON.parse(storedData);
    }
    else {
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
    var editingCardId = [null];
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
        saveDataToLocalStorage(data);
    });
    toDoList.addEventListener("click", function (event) {
        var target = event.target;
        if (target.classList.contains("delete-icon")) {
            deleteHandler(event, data, "toDo");
            saveDataToLocalStorage(data);
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
};
init();
