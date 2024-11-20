const repeatPayment = document.getElementById("repeat-payment");
repeatPayment.value = "no";

const renewalDuration = document.getElementById("renewal-duration");
renewalDuration.disabled = true;
repeatPayment.addEventListener("change", function () {
  if (this.value === "yes") {
    renewalDuration.disabled = false;
  } else {
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
    pinned: false,
  });
  renderList(tasks);
  taskForm.reset();
  repeatPayment.value = "no";
  const event = new Event("change");
  repeatPayment.dispatchEvent(event);
});

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
    const pinTitle = document.createElement("p");
    pinTitle.textContent = "PIN ITEM";
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
      pinTitle,
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
    // Make the pinitem
    const pinIcon = document.createElement("img");
    pinIcon.alt = "Pin icon image";
    if (task.pinned) {
      pinIcon.src = `images/pinned.png`;
    } else {
      pinIcon.src = `images/unpinned.png`;
    }
    pinIcon.addEventListener("click", () => {
      task.pinned = !task.pinned;
      taskArr.splice(i, 1);
      console.log(i);
      if (task.pinned) {
        pinIcon.src = `images/pinned.png`;
        taskArr.unshift(task);
      } else {
        pinIcon.src = `images/unpinned.png`;
        taskArr.push(task);
      }
      clearListContainer();
      buildList(taskArr);
      saveStateToLocalStorage();
    });
    // Make the task description
    const descriptionElem = document.createElement("input");
    descriptionElem.value = task.description;
    descriptionElem.classList.add("item-description");
    descriptionElem.readOnly = true;
    // Make the amount description
    const amountElem = document.createElement("p");
    amountElem.textContent = task.amount + "$";

    //Due date
    const dueDateElem = document.createElement("p");
    dueDateElem.textContent = task.dueDateFormatted;
    const currentDate = new Date();
    const actualDue = new Date(task.dueDateSelected);
    const differenceInDays = (actualDue - currentDate) / (1000 * 60 * 60 * 24);
    if (differenceInDays < 8) {
      dueDateElem.textContent = "";
      const dueDateText = document.createTextNode(task.dueDateFormatted);
      const lineBreak = document.createElement("br");
      let daysLeftText = document.createTextNode(
        `Only ${parseInt(differenceInDays)} day(s) left`
      );
      if (differenceInDays <= 0) {
        daysLeftText = document.createTextNode(`Past Due!!!!`);
      }
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

    renewButton.textContent = "Renew Payment";
    if (task.repeatPayment === "yes") {
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

    renewButton.addEventListener("click", () => {
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
      pinIcon,
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

//To format date to a more pleasing way
function formatDateToDDMMYYYY(date) {
  const d = new Date(date); // Convert input to Date object
  const day = String(d.getDate()).padStart(2, "0"); // Ensure 2-digit day
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month (Months are 0-based)
  const year = d.getFullYear(); // Get the full year

  return `${day}-${month}-${year}`; // Combine into dd-mm-yyyy
}

//dedicated method to clear the list before rendering list
function clearListContainer() {
  while (listContainer.firstChild) {
    listContainer.firstChild.remove();
  }
}
