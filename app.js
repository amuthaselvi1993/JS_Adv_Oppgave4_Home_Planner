const repeatPayment = document.getElementById("repeat-payment");
repeatPayment.value = "no";

const renewalDuration = document.getElementById("renewal-duration");
renewalDuration.disabled = true;
console.log(renewalDuration);
repeatPayment.addEventListener("change", function () {
  if (this.value === "yes") {
    renewalDuration.disabled = false;
  } else {
    // renewalDuration.classList.add("hidden");
    renewalDuration.disabled = true;
  }
});

const taskForm = document.querySelector("#plan-form");
const taskInput = document.querySelector("#plan-item");
const listContainer = document.querySelector("#list-container");

let tasks = [];

// Load data from localStorage
const storedTasks = localStorage.getItem("tasks");
if (storedTasks) {
  tasks = JSON.parse(storedTasks);
  renderList(tasks);
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(taskForm);
  // Trigger error if task is empty
  // if (!formData.get("plan-item")) {
  //   showError("You can't submit an empty task");
  //   return;
  // }
  const selectedElement = document.getElementById("renewal-duration");
  const selectedText =
    selectedElement.options[selectedElement.selectedIndex].text;
  //lager nytt task object og pusher til tasks variabel.
  tasks.push({
    dueDateSelected: formData.get("due-date"),
    dueDateFormatted: formatDateToDDMMYYYY(formData.get("due-date")),
    description: formData.get("plan-item"),
    repeatPayment: formData.get("repeat-payment"),
    renewTime: formData.get("renewal-duration"),
    renewalWindow: selectedText,
    amount: formData.get("amount"),
  });
  console.log(tasks);
  renderList(tasks);
  // taskForm.reset();
  // repeatPayment.value = "no";
  // const event = new Event("change");
  // repeatPayment.dispatchEvent(event);
});

// sortBy.addEventListener("change", () => {
//   renderList(tasks);
// });

function renderList(taskArr) {
  // Clear local storage if task array is empty
  if (taskArr.length === 0) {
    localStorage.removeItem("tasks");
  }
  // buildList(filterAndSort(taskArr));
  buildList(taskArr);
  saveStateToLocalStorage();
}

function buildList(taskArr) {
  // Empty list
  clearListContainer();
  if (taskArr) {
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("title-container");

    // Make the task description
    const descriptionTitle = document.createElement("p");
    descriptionTitle.classList.add("item-description");
    descriptionTitle.textContent = "PLAN INFORMATION";
    const amountTitle = document.createElement("p");
    amountTitle.textContent = "AMOUNT";
    // Make the last paid
    const dueDateTitle = document.createElement("p");
    dueDateTitle.textContent = "DUE DATE";
    // Renewal Date:
    const renewalDateTitle = document.createElement("p");
    renewalDateTitle.textContent = "RENEWAL DURATION";
    //Renew Button
    const renewButtonTitle = document.createElement("p");
    renewButtonTitle.textContent = "CLICK TO RENEW";
    // Add delete-button
    const deleteButtonTitle = document.createElement("p");
    deleteButtonTitle.textContent = "DELETE HERE";
    // Appends
    titleContainer.append(
      descriptionTitle,
      amountTitle,
      dueDateTitle,
      renewalDateTitle,
      renewButtonTitle,
      deleteButtonTitle
    );
    listContainer.append(titleContainer);
  }
  taskArr.forEach((task, i) => {
    // Make the task container
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container");
    // Make the timestamp

    // Make the task description
    const descriptionElem = document.createElement("input");
    descriptionElem.value = task.description;
    descriptionElem.classList.add("item-description");
    descriptionElem.readOnly = true;
    // Make the amount description
    const amountElem = document.createElement("p");
    amountElem.textContent = task.amount + "$";
    console.log(amountElem);
    //Due date
    const dueDateElem = document.createElement("p");
    dueDateElem.textContent = task.dueDateFormatted;
    const currentDate = new Date();
    const actualDue = new Date(task.dueDateSelected);

    const differenceInDays = (actualDue - currentDate) / (1000 * 60 * 60 * 24);
    console.log(differenceInDays);
    if (differenceInDays < 8) {
      dueDateElem.textContent = "";
      const dueDateText = document.createTextNode(task.dueDateFormatted);
      const lineBreak = document.createElement("br");
      const daysLeftText = document.createTextNode(
        `Only ${parseInt(differenceInDays)} day(s) left`
      );
      const span = document.createElement("span");
      span.classList.add("warning-text"); // Add a class to the <span>
      span.appendChild(daysLeftText);

      dueDateElem.append(dueDateText, lineBreak, span);
    } else {
      dueDateElem.textContent = task.dueDateFormatted;
    }

    const renewalDate = document.createElement("p");
    renewalDate.classList.add("items");
    const renewButton = document.createElement("button");
    renewButton.classList.add("button-style");
    console.log(task.repeatPayment);
    renewButton.textContent = "Renew Payment";
    if (task.repeatPayment === "yes") {
      console.log("control coming here");
      renewalDate.textContent = task.renewalWindow;
      renewButton.classList.remove("button-style-disabled");
      renewButton.classList.add("button-style");
      renewButton.disabled = false;
    } else {
      renewalDate.textContent = "NA";
      renewButton.classList.remove("button-style");
      renewButton.classList.add("button-style-disabled");
      renewButton.disabled = true;
    }
    console.log(renewButton.disabled);
    // Make the timestamp

    renewButton.addEventListener("click", () => {
      console.log("control coming inside click action");
      const calculateNewDate = new Date(task.dueDateSelected); // create current date object to find the updated due date
      if (task.renewTime === "oneMonth") {
        calculateNewDate.setDate(calculateNewDate.getDate() + 30);
      } else if (task.renewTime === "threeMonth") {
        calculateNewDate.setDate(calculateNewDate.getDate() + 90);
      } else if (task.renewTime === "oneYear") {
        calculateNewDate.setDate(calculateNewDate.getDate() + 365);
      }
      // Add the specified number of days
      task.dueDateSelected = calculateNewDate;
      task.dueDateFormatted = formatDateToDDMMYYYY(task.dueDateSelected);
      console.log("new due date" + task.dueDateFormatted);
      dueDateElem.textContent = task.dueDateFormatted;
      saveStateToLocalStorage();
    });
    // Add delete-button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this item?")) {
        taskArr.splice(i, 1);
        clearListContainer();
        buildList(taskArr);
        saveStateToLocalStorage();
      }
    });
    // Appends
    taskContainer.append(
      descriptionElem,
      amountElem,
      dueDateElem,
      renewalDate,
      renewButton,
      deleteButton
    );
    listContainer.append(taskContainer);
  });
}

function saveStateToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Get today's date to set as min date for date picker to avoid selecting past days for due date
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
const dd = String(today.getDate()).padStart(2, "0");

// Format the date as YYYY-MM-DD
const currentDate = `${yyyy}-${mm}-${dd}`;

// Set the min attribute of the date picker
const dateInput = document.getElementById("due-date");
dateInput.min = currentDate;

function formatDateToDDMMYYYY(date) {
  const d = new Date(date); // Convert input to Date object
  const day = String(d.getDate()).padStart(2, "0"); // Ensure 2-digit day
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month (Months are 0-based)
  const year = d.getFullYear(); // Get the full year

  return `${day}-${month}-${year}`; // Combine into dd-mm-yyyy
}

function clearListContainer() {
  while (listContainer.firstChild) {
    listContainer.firstChild.remove();
  }
}
// function filterAndSort(arr) {
//   return arr
//     .filter((e) => (!showCompleted.checked ? !e.completed : e))
//     .sort((a, b) => {
//       if (sortBy.value === "time-asc") {
//         return new Date(a.timeStamp) - new Date(b.timeStamp);
//       } else if (sortBy.value === "time-desc") {
//         return new Date(b.timeStamp) - new Date(a.timeStamp);
//       } else if (sortBy.value === "alpha-asc") {
//         return b.description.localeCompare(a.description);
//       } else if (sortBy.value === "alpha-desc") {
//         return a.description.localeCompare(b.description);
//       }
//     });
// }

// Load data from localStorage
// showCompleted.checked = localStorage.getItem("showCompleted") === "true";
// sortBy.value = localStorage.getItem("sortBy");

// Store boolean value of showCompleted checkbox
// localStorage.setItem("showCompleted", showCompleted.checked);
// Store the value of the sort by select element
// localStorage.setItem("sortBy", sortBy.value);
