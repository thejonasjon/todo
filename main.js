'use strict';

// Change this two instance to switch from local storage to session,
// saveTodosToSessionStorage = saveTodosToSessionStorage
// getTodosFromLocalStorage = getTodosFromSessionStorage

// Get & set variables from DOM elements
const todoInput = document.querySelector("#todoInput");
const addTodoBtn = document.querySelector("#addTodoBtn");
const requiredError = document.querySelector(".required");
const todoCardBlock = document.querySelector("#todoCardBlock");
const Filters = document.querySelector(".filter-block");

const svgPaths = {
    markCompleted: "m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z",
    edit: "M4.5 17.207V19a.5.5 0 0 0 .5.5h1.793a.5.5 0 0 0 .353-.146l8.5-8.5l-2.5-2.5l-8.5 8.5a.5.5 0 0 0-.146.353ZM15.09 6.41l2.5 2.5l1.203-1.203a1 1 0 0 0 0-1.414l-1.086-1.086a1 1 0 0 0-1.414 0z",
    delete: "M7.616 20q-.672 0-1.144-.472T6 18.385V6H5V5h4v-.77h6V5h4v1h-1v12.385q0 .69-.462 1.153T16.384 20zM17 6H7v12.385q0 .269.173.442t.443.173h8.769q.23 0 .423-.192t.192-.424zM9.808 17h1V8h-1zm3.384 0h1V8h-1zM7 6v13z"
};

const todoActionButtons = [
    { id: "todoCompletedUncompleteBtn", classes: ["mark-completed-uncomplete"], path: svgPaths.markCompleted },
    { id: "editTodoBtn", classes: ["edit"], path: svgPaths.edit },
    { id: "deleteTodoBtn", classes: ["delete"], path: svgPaths.delete }
];

// Helpers
function createElement(tag, selectors = {}) {
    const newElement = document.createElement(tag);
    if (selectors.id) newElement.id = selectors.id;
    if (selectors.classes) selectors.classes.forEach(cls => newElement.classList.add(cls));
    if (selectors.html) newElement.innerHTML = selectors.html;
    return newElement;
}

function createSVG(classes, pathData) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    classes.forEach(cls => svg.classList.add(cls));
    svg.innerHTML = `<path fill="currentColor" d="${pathData}"/>`;
    return svg;
}

// Save todos to localStorage
function saveTodosToLocalStorage(todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Save todos to sessionStorage
// function saveTodosToSessionStorage(todos) {
//     sessionStorage.setItem("todos", JSON.stringify(todos));
// }

// Get todos from localStorage
function getTodosFromLocalStorage() {
    return JSON.parse(localStorage.getItem("todos")) || [];
}

// Get todos from sessionStorage
// function getTodosFromSessionStorage() {
//     return JSON.parse(sessionStorage.getItem("todos")) || [];
// }

function renderTodos(todos) {
    todoCardBlock.innerHTML = "";
    todos.forEach((todo, index) =>
        {createTodoCard(todo, index)
        });
}

function createTodoCard(todo, index) {
    const divCard = createElement("div", { classes: ["card"], id: `todo-${index}` });

    // creates a <span> element with the inner content (text or HTML) set to todo.text
    // const todoText = divCard.appendChild(createElement("span", { html: todo.text }));
    const todoText = document.createElement("span");
    todoText.textContent = todo.text;
    divCard.appendChild(todoText);
    if (todo.completed) todoText.classList.add("completed");

    const divActionBlock = divCard.appendChild(createElement("div", { classes: ["actions-block"] }));
    todoActionButtons.forEach(btnObj => {
        const todoBtn = createElement("span", { id: btnObj.id });
        const todoBtnSvg = createSVG(btnObj.classes, btnObj.path);
        todoBtn.appendChild(todoBtnSvg);
        divActionBlock.appendChild(todoBtn);
    });

    todoCardBlock.appendChild(divCard);
}

// Add a new or update an existing todo
function handleTodoSave() {
    const todos = getTodosFromLocalStorage();

    if (todoInput.value === "") {
        requiredError.style.display = "block";
        todoInput.addEventListener("focus", () => {
            requiredError.style.display = "none";
        });
        return;
    }

    if (todoInput.classList.contains("update-mode")) {
        // Update existing todo using dataset to access all attribute with data-* on the input
        const todoIndex = todoInput.dataset.index;
        todos[todoIndex].text = todoInput.value;
        // console.log(todoInput.value)
        todoInput.classList.remove("update-mode");
        todoInput.removeAttribute("data-index");
    } else {
        // Add new todo
        todos.push({ text: todoInput.value, completed: false });
    }

    saveTodosToLocalStorage(todos);
    renderTodos(todos);
    todoInput.value = "";
}

// Delete a todo
function handleTodoDelete(index) {
    const todos = getTodosFromSessionStorage();
    todos.splice(index, 1);
    getTodosFromLocalStorage(todos);
    renderTodos(todos);
}

// Mark a todo as completed/uncompleted
function handleTodoToggleCompletion(index) {
    const todos = getTodosFromLocalStorage();
    todos[index].completed = !todos[index].completed;
    saveTodosToLocalStorage(todos);
    renderTodos(todos);
}

// Enter edit mode
function enterEditMode(index) {
    const todos = getTodosFromLocalStorage();
    todoInput.value = todos[index].text;
    todoInput.classList.add("update-mode");
    todoInput.dataset.index = index;
}

// Filter todos
function filterTodos(filter) {
    const todos = getTodosFromLocalStorage();
    let filteredTodos;

    switch (filter) {
        case "Completed":
            filteredTodos = todos.filter(todo => todo.completed);
            break;
        case "Uncompleted":
            filteredTodos = todos.filter(todo => !todo.completed);
            break;
        default:
            filteredTodos = todos;
    }

    renderTodos(filteredTodos);
}



// Event Listeners
addTodoBtn.addEventListener("click", handleTodoSave);

document.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    // Use from array method here to be able to convert html collect into JS array,
    // then i use indexOf method on it
    const index = Array.from(todoCardBlock.children).indexOf(card);

    if (e.target.closest("#deleteTodoBtn")) {
        handleTodoDelete(index);
    } else if (e.target.closest("#todoCompletedUncompleteBtn")) {
        handleTodoToggleCompletion(index);
    } else if (e.target.closest("#editTodoBtn")) {
        enterEditMode(index);
    }
});

Filters.addEventListener("click", (e) => {
    // Get the only text, e.g All, Completed, Uncompleted
    const filter = e.target.textContent;
    filterTodos(filter);
});

// Initial Render
renderTodos(getTodosFromLocalStorage());
