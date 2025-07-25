// Import the functions you need from the SDKs you need
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, doc, collection, updateDoc, addDoc, query, where, getDocs, arrayUnion } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


const adminBttn = document.getElementById("AdminSubmit");
const employeeBttn = document.getElementById("Esubmit");

//Validate Admin Id
const validateAdminId = () => {
    const adminInput = document.getElementById("AdminId").value.trim()
    const wrongInput = document.getElementById("incorrect");

    const p = query(
        collection(db, "admins"),
        where("ID", "==", adminInput)
    );

    getDocs(p)
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                wrongInput.innerHTML = "Wrong ID"
                return;
            }

            querySnapshot.forEach((doc) => {
                const employeeData = doc.data()

                wrongInput.innerHTML = "Access Granted";
                wrongInput.style.color = "green"

                setTimeout(() => {
                    window.location.href = "Admin_Dashboard.html"
                }, 1500);

            })
        })
        .catch((error) => {
            wrongInput.textContent = " Error!"
            wrongInput.style.color = "red"
        });

    // get all employees
    const r = query(
        collection(db, "users")
    );

    getDocs(r)
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
            }
            const allEmployees = [];

            querySnapshot.forEach((doc) => {
                const employee = doc.data()
                allEmployees.push(employee)
                sessionStorage.setItem("allEmployees", JSON.stringify(allEmployees));
            });

        })
        .catch((error) => {
        });


}

if (adminBttn) {
    adminBttn.addEventListener("click", validateAdminId);
}

//display all Employees
const allemployeeDiv = document.getElementById("allEmployees")
const storedEmployees = JSON.parse(sessionStorage.getItem("allEmployees")) || [];

if (allemployeeDiv) {
    let showAllEmployees = ""

    for (let i = 0; i < storedEmployees.length; i++) {
        showAllEmployees +=
            `<div class="empDiv" data-index="${i}">
          <p class="emp_I">
            Name: ${storedEmployees[i].Firstname}  ${storedEmployees[i].Lastname} <br> 
            Job Position: ${storedEmployees[i].position} <br> 
            ID: ${storedEmployees[i].id} 
            </p> 
          </div>`;
    }
    allemployeeDiv.innerHTML = showAllEmployees;

}


//Validate Employeee Id
const validateEmployeeId = () => {
    const employeeInput = document.getElementById("EmployeeId").value.trim();
    const wrongInput = document.getElementById("incorrect");


    const q = query(
        collection(db, "users"),
        where("id", "==", employeeInput)
    );

    getDocs(q)
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                wrongInput.textContent = "Wrong Id"
                wrongInput.style.color = "red"
                return;
            }

            querySnapshot.forEach((doc) => {
                const employeeData = doc.data()

                sessionStorage.setItem("EmployeeData", JSON.stringify(employeeData));

                sessionStorage.setItem("EmployeeDocID", JSON.stringify(doc.id))


                //console.log(doc.id, "=>", doc.data());

                wrongInput.textContent = "Access Granted"
                wrongInput.style.color = "green"



                setTimeout(() => {
                    window.location.href = "Check_In_Out.html"
                }, 1500)
            });

        })
        .catch((error) => {
            wrongInput.textContent = " Error!"
            wrongInput.style.color = "red"
        });
}

if (employeeBttn) {
    employeeBttn.addEventListener("click", validateEmployeeId)
}
const checkIn = document.getElementById('checkin')

// Employee Details
const employeeName = document.getElementById("EmployeeName");
const employeeJobPosition = document.getElementById("EmployeePosition")
const employeedata = JSON.parse(sessionStorage.getItem("EmployeeData"))

//Employee Time history
const tdDisplay = document.getElementById("display-time")

if (employeedata && employeeName && employeeJobPosition && tdDisplay) {
    //display name
    employeeName.textContent = `Name: ${employeedata.Firstname} ${employeedata.Lastname}`
    employeeJobPosition.textContent = `Position: ${employeedata.position}`

    const sessionTime = JSON.parse(sessionStorage.getItem("EmployeeData")) || {};

    // display time history
    if (Array.isArray(sessionTime.time)) {
        let disPlay = ""

        for (let i = 0; i < sessionTime.time.length; i++) {
            disPlay += `<li id="times"> ${sessionTime.time[i]} </li>`
        }

        tdDisplay.innerHTML = disPlay;
    } else {
        tdDisplay.innerHTML = `<li id="times"> No CheckIn/Out History </li>`;
    }

}

//Days and Months
let now = new Date();

// checkIn
if (checkIn) {
    checkIn.addEventListener("click", checkin => {
        // console.log Check In time

        const now = new Date();

        const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]
        const months = ["Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"]

        const day = days[now.getDay()];
        const month = months[now.getMonth()];
        const hour = now.getHours();
        const date = now.getDate();
        const year = now.getFullYear();
        const minute = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        const ampm = hour > 12 ? "PM" : "AM";
        hour == hour % 12 || 12;

        let localTime = `${hour}:${minute}:${seconds} ${ampm}, ${day} ${date} ${month} ${year}`
        // time.push(`Check In: ${localTime}`);

        //Update sessionStorage

        const sessionTime = JSON.parse(sessionStorage.getItem("EmployeeData")) || {};

        if (!Array.isArray(sessionTime.time)) {
            sessionTime.time = [];
        }

        sessionTime.time.push(`Check Out Time: ${localTime}`)
        sessionStorage.setItem("EmployeeData", JSON.stringify(sessionTime));


        // Update  database
        const employeedocId = JSON.parse(sessionStorage.getItem("EmployeeDocID"))
        const userTime = doc(db, "users", employeedocId)

        updateDoc(userTime, {
            time: arrayUnion(`Check In: ${localTime}`)
        });

        displayUserTime()
        //showTime()
    })
}

// checkOut
const checkOut = document.getElementById("checkout")
if (checkOut) {
    checkOut.addEventListener("click", checkout => {
        // console.log Check out time
        const now = new Date();

        const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]
        const months = ["Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"]

        const day = days[now.getDay()];
        const month = months[now.getMonth()];
        const hour = now.getHours();
        const date = now.getDate();
        const year = now.getFullYear();
        const minute = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        const ampm = hour > 12 ? "PM" : "AM";
        hour == hour % 12 || 12;

        let localTime = `${hour}:${minute}:${seconds} ${ampm}, ${day} ${date} ${month} ${year}`
        //time.push(`Check Out Time: ${localTime}`);
        //console.log(time)

        // push to SessionStorage

        const sessionTime = JSON.parse(sessionStorage.getItem("EmployeeData")) || {};

        if (!Array.isArray(sessionTime.time)) {
            sessionTime.time = [];
        }

        sessionTime.time.push(`Check Out Time: ${localTime}`)
        sessionStorage.setItem("EmployeeData", JSON.stringify(sessionTime));



        // push to Firebase
        const employeedocId = JSON.parse(sessionStorage.getItem("EmployeeDocID"))
        const userTime = doc(db, "users", employeedocId)

        updateDoc(userTime, {
            time: arrayUnion(`Check Out: ${localTime}`)
        });

        displayUserTime()

        //showTime()
    })
}

//Display time
const displayUserTime = () => {
    const tdDisplay = document.getElementById("display-time")
    const sessionTime = JSON.parse(sessionStorage.getItem("EmployeeData")) || {};
    let disPlay = ""
    if (Array.isArray(sessionTime.time)) {

        disPlay = ""

        for (let i = 0; i < sessionTime.time.length; i++) {
            disPlay += `<li id="times"> ${sessionTime.time[i]} </li>`
        }


        tdDisplay.innerHTML = disPlay;

    } else {
        disPlay += `<li id="times"> No CheckIn/Out History </li>`;
        tdDisplay.innerHTML = disPlay;
    }
}

// generate ID
const idGenerator = () => {
    return "CLS" + Math.floor(Math.random() * 9999999)
}

// New Employee
let firstName = document.getElementById("createFistName");
let lastName = document.getElementById("createLastName");
let position = document.getElementById("JobPosition");
let createEmployee = document.getElementById("createEmployee");
let progress = document.getElementById("progress");

let userObjects = {}
// create user
async function writeData() {
    let genratedId = idGenerator();
    try {
        const docRef = await addDoc(collection(db, "users"), {
            Firstname: firstName.value.trim(),
            Lastname: lastName.value.trim(),
            position: position.value.trim(),
            id: genratedId,
            time: []
        });

        userObjects = {
            Firstname: firstName.value.trim(),
            Lastname: lastName.value.trim(),
            position: position.value.trim(),
            id: genratedId,
            time: []
        }
        console.log(userObjects)

    } catch (e) {
        console.error("Error adding document: ")
    }
}

//create employee
if (createEmployee) {
    const storedEmployees = JSON.parse(sessionStorage.getItem("allEmployees")) || [];
    if (!Array.isArray(storedEmployees)) {
        storedEmployees = [];
    }

    createEmployee.addEventListener("click", async (e) => {

        e.preventDefault();

        if (firstName.value.trim() === "" ||
            lastName.value.trim() === "" ||
            position.value.trim() === ""
        ) {
            progress.textContent = "Incomplete Information";
            progress.style.color = "orange";
            return;
        }

        createEmployee.disabled = true;
        createEmployee.textContent = "Saving...";

        try {

            await writeData();
            storedEmployees.push(userObjects)
            sessionStorage.setItem("allEmployees", JSON.stringify(storedEmployees));
            progress.textContent = "Successfull";
            progress.style.color = "green";

            createEmployee.textContent = "Create";


            setTimeout(() => {
                location.reload();
            }, 2500)


        } catch (e) {
            progress.textContent = "Error"
            progress.style.color = "red";

            createEmployee.disabled = true;
            createEmployee.textContent = "Create";
        }


    });
}

//Close create Employee Section
let closeIcon = document.getElementById("close");
let popUp = document.getElementById("newEmployee");

if (closeIcon) {
    closeIcon.addEventListener("click", () => {
        popUp.style.display = "none";
    });
}

//Open Create Employee Section
let openIcon = document.getElementById("newStaff");
let newEmployeeSection = document.getElementById("newEmployee");

if (openIcon) {
    openIcon.addEventListener("click", () => {
        newEmployeeSection.style.display = "block";
    });
}

// Attach click event after rendering
const innerDiv = document.getElementById("edpDiv")
const fullEmployeedisplay = document.getElementById("employeeDetailPopup")
const timeDiv = document.getElementById("emptime")

let currentEmployeeData = null;


document.querySelectorAll(".empDiv").forEach(emp => {
    emp.addEventListener("click", function () {
        const index = this.dataset.index;
        const empData = storedEmployees[index];
        currentEmployeeData = empData

        fullEmployeedisplay.style.display = "block";


        edpDiv.innerHTML = ` 
        <h2>Full Employee Information:</h2><br>
        <p>Name: ${empData.Firstname} ${empData.Lastname}</p><br>
        <p>ID: ${empData.id}</p><br>
        <p>Position: ${empData.position}</p><br>
        <p>Time:<br></p>`

        timeDiv.innerHTML = "";

        if (Array.isArray(empData.time) && empData.time.length > 0) {
            for (let i = 0; i < empData.time.length; i++) {
                timeDiv.innerHTML += `${empData.time[i]}<br>`;
            }
        } else {
            timeDiv.innerHTML = "No time records available.";
        }



    });
});



const employeeClose = document.getElementById("closeE");

if (employeeClose) {
    employeeClose.addEventListener("click", () => {
        fullEmployeedisplay.style.display = "none";
    });
}


const downloadBtn = document.getElementById("Dowloadbtn")
// Dowload Info


if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
        if (!currentEmployeeData) {
            alert("No employee data to download.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let content = `Full Employee Information\n\n`;
        content += `Name: ${currentEmployeeData.Firstname} ${currentEmployeeData.Lastname}\n`;
        content += `ID: ${currentEmployeeData.id}\n`;
        content += `Position: ${currentEmployeeData.position}\n\n`;
        content += `Check-in/Out Times:\n`;

        if (Array.isArray(currentEmployeeData.time) && currentEmployeeData.time.length > 0) {
            currentEmployeeData.time.forEach((time, i) => {
                content += `${i + 1}. ${time}\n`;
            });
        } else {
            content += "No time records available.\n";
        }

        doc.text(content, 10, 10);
        doc.save(`${currentEmployeeData.Firstname}_${currentEmployeeData.Lastname}_info.pdf`);
    });
}

