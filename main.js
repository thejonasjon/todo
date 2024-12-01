'use strict';

// Get & set variables from DOM elements
const todoInput = document.querySelector("#todoInput");
const addTodoBtn = document.querySelector("#addTodoBtn");
const requiredError = document.querySelector(".required");
const todoCardBlock = document.querySelector("#todoCardBlock");

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

// Create element helper
function createElement(tag, selectors = {}) {
    const newElement = document.createElement(tag);
    if (selectors.id) newElement.id = selectors.id;
    if (selectors.classes) selectors.classes.forEach(cls => newElement.classList.add(cls));
    if (selectors.html) newElement.innerHTML = selectors.html;
    return newElement;
}

// Create SVG helper
function createSVG(classes, pathData) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    classes.forEach(cls => svg.classList.add(cls));
    svg.innerHTML = `<path fill="currentColor" d="${pathData}"/>`;
    return svg;
}

// Add new todo
let editingCard = null;

addTodoBtn.addEventListener("click", () => {
    if (todoInput.classList.contains("update-mode") && editingCard) {
        // Update the text content of the editing card
        const oldText = editingCard.querySelector("span");
        if (todoInput.value === ""){
            requiredError.style.display = "block";
        } else if (todoInput.value === oldText.textContent){
            requiredError.textContent = "No changes, update discarded.";
            requiredError.style.display = "block";

            // To be improve to display none after few munite, #Need to read on js datetime again
            // Display warning message when no update is made
            if (requiredError.style.display === "block"){
                todoInput.addEventListener("focus", () => {
                    requiredError.style.display = "none";
                    requiredError.textContent = "This field is required.";
                });
            }

        } else {
            oldText.innerText = todoInput.value;
        }

        // Reset styles and states for the editing card
        resetEditMode();

        // Clear the input and remove update mode
        todoInput.value = "";
        todoInput.classList.remove("update-mode");

    } else if (todoInput.value !== "") {
        // Create a new todo card if not in update mode
        const divCard = createElement("div", { classes: ["card"] });
        const todoText = divCard.appendChild(createElement("span"));
        todoText.innerText = todoInput.value;

        const divActionBlock = divCard.appendChild(createElement("div", { classes: ["actions-block"] }));

        todoActionButtons.forEach(btnObj => {
            const todoBtn = createElement("span", { id: btnObj.id });
            const todoBtnSvg = createSVG(btnObj.classes, btnObj.path);
            todoBtn.appendChild(todoBtnSvg);
            divActionBlock.appendChild(todoBtn);
        });

        todoCardBlock.appendChild(divCard);
        todoInput.value = "";
    } else {
        // Show required message if input is empty
        requiredError.style.display = "block";
        todoInput.addEventListener("focus", () => {
            requiredError.style.display = "none";
        });
    }
});

// Handles clicking on Edit, ensuring only one item is in edit mode
document.addEventListener("click", (e) => {
    const editButton = e.target.closest("#editTodoBtn");
    if (editButton) {
        const card = editButton.closest(".card");

        // If the clicked card is already in edit mode, do nothing
        if (editingCard === card) return;

        // Clear the current edit mode if another card is being edited
        if (editingCard) resetEditMode();

        // Enter edit mode for the new card
        enterEditMode(card);
    }
});

todoCardBlock.addEventListener("click", todoActions)

// Mark to complete/uncomplete, delete
function todoActions(e) {
    e.preventDefault();
    const clickedElement = e.target;

    if (clickedElement.closest("#todoCompletedUncompleteBtn")) {
        const card = clickedElement.closest(".card");
        const todoTextSpan = card.querySelector("span");
        todoTextSpan.classList.toggle("completed");

    } else if (clickedElement.closest("#deleteTodoBtn")) {
        const card = clickedElement.closest(".card");

        // If deleting the currently editing card, reset the state
        if (editingCard === card) resetEditMode();
        card.remove();
    }
}

// Enter edit mode for a card
function enterEditMode(card) {
    const todoTextSpan = card.querySelector("span");

    // Set the input value to the current todo text
    todoInput.value = todoTextSpan.textContent;

    // Apply styles and track the card
    card.style.pointerEvents = "none";
    const svgs = card.querySelectorAll("svg")
        svgs.forEach(svg => {
            svg.classList.add("editing");
        });
    card.style.backgroundColor = "#e7e7e7"
    editingCard = card;

    // Mark the input as in update mode
    todoInput.classList.add("update-mode");
}

// Reset edit mode for the current editing card
function resetEditMode() {
    if (!editingCard) return;

    // Reset styles and remove edit-related classes
    editingCard.style.pointerEvents = "auto";
    editingCard.classList.remove("editing");
    const svgs = editingCard.querySelectorAll("svg")
        svgs.forEach(svg => {
            svg.classList.remove("editing");
        });
    editingCard.style.backgroundColor = "unset"
    editingCard = null;

    // Clear the update mode on input
    todoInput.classList.remove("update-mode");
}

// Filters functions
const Filters = document.querySelector(".filter-block");

Filters.addEventListener("click", filterTodo);

function filterTodo(e) {
    const filter = e.target;

    // Ensure the clicked element is a button
    if (filter.tagName !== "BUTTON") return;

    // Remove the 'active' class from all buttons
    const allFilters = Filters.querySelectorAll("button");
    allFilters.forEach(button => button.classList.remove("active"));

    // Add 'active' class to the clicked button
    filter.classList.add("active");

    // Select all the cards
    const todoCards = document.querySelectorAll(".card");

    // Show/Hide cards based on the filter type
    todoCards.forEach(card => {
        const isCompleted = card.querySelector(".completed");

        // Reset display for all cards
        card.style.display = "flex";

        switch (filter.textContent) {
            case "All":
                card.style.display = "flex";
                break;

            case "Completed":
                if (isCompleted) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
                break;

            case "Uncompleted":
                if (!isCompleted) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
                break;
        }
    });
}


// BUGS / Improvement: Create todo on uncompleted state does not working fine verse versa.
// Cater for empty state