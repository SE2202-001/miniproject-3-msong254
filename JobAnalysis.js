//This class carries the details of the jobs, with parameters such as type
class Job {
    constructor(title, type, level, skills, posted, details) {
        this.title = title;
        this.type = type;
        this.level = level;
        this.skills = skills;
        this.posted = posted;
        this.details = details;
    }

    //this method returns the details
    getDetails() {
        return `
        <strong>Title:</strong> ${this.title} <br>
        <strong>Type:</strong> ${this.type} <br>
        <strong>Level:</strong> ${this.level} <br>
        <strong>Skills:</strong> ${this.skills.join(", ")} <br>
        <strong>Posted:</strong> ${this.posted} <br>
        <strong>Details:</strong> ${this.details}
        `;
    }
}

//declaring global variables here
let jobs = [];
const jobListings = document.getElementById("jobListings");
const errorMessages = document.getElementById("errorMessages");

//this section creates a new reader for files, and then takes in the JSON file
document.getElementById("fileInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Matches the JSON File
                jobs = data.map(
                    (job) =>
                        new Job(
                            job["Title"], 
                            job["Type"], 
                            job["Level"], 
                            job["Skill"] ? job["Skill"].split(",") : [], 
                            job["Posted"], 
                            job["Details"]
                        )
                );
                populateFilters();
                displayJobs(jobs);
                errorMessages.textContent = ""; // Clear error messages
            } catch (err) {
                console.error("Error parsing JSON:", err); //catches the error
                errorMessages.textContent = "You uploaded an invalid JSON file. Try Again"; //error displaying message
            }
        };
        reader.readAsText(file);
    }
});

// Display Jobs
function displayJobs(jobList) {
    jobListings.innerHTML = "";
    if (jobList.length === 0) {
        jobListings.textContent = "There are no jobs that match these criteria";
        return;
    }
    jobList.forEach((job) => {
        const jobDiv = document.createElement("div");
        jobDiv.classList.add("job");
        jobDiv.innerHTML = `<h3>${job.title}</h3><p>${job.type} - ${job.level}</p>`;
        jobDiv.addEventListener("click", () => {
            alert(job.getDetails());
        });
        jobListings.appendChild(jobDiv);
    });
}

//This function populates the filters
function populateFilters() {
    const typeFilter = document.getElementById("typeFilter");
    const levelFilter = document.getElementById("levelFilter");
    const skillFilter = document.getElementById("skillFilter");

    const types = [...new Set(jobs.map((job) => job.type))];
    const levels = [...new Set(jobs.map((job) => job.level))];
    const skills = [...new Set(jobs.flatMap((job) => job.skills))];

    populateDropdown(typeFilter, types);
    populateDropdown(levelFilter, levels);
    populateDropdown(skillFilter, skills);
}


function populateDropdown(dropdown, items) {
    dropdown.innerHTML = `<option value="">All</option>`;
    items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });
}

// Filter Jobs
document.getElementById("typeFilter").addEventListener("change", filterJobs);
document.getElementById("levelFilter").addEventListener("change", filterJobs);
document.getElementById("skillFilter").addEventListener("change", filterJobs);

function filterJobs() {
    const type = document.getElementById("typeFilter").value;
    const level = document.getElementById("levelFilter").value;
    const skill = document.getElementById("skillFilter").value;

    const filteredJobs = jobs.filter((job) => {
        return (
            (type === "" || job.type === type) &&
            (level === "" || job.level === level) &&
            (skill === "" || job.skills.includes(skill))
        );
    });

    displayJobs(filteredJobs);
}

// Sort Jobs
document.getElementById("sortByTitle").addEventListener("click", () => {
    jobs.sort((a, b) => a.title.localeCompare(b.title));
    displayJobs(jobs);
});

document.getElementById("sortByTime").addEventListener("click", () => {
    jobs.sort((a, b) => parsePostedTime(b.posted) - parsePostedTime(a.posted));
    displayJobs(jobs);
});

function parsePostedTime(posted) {
    const [value, unit] = posted.split(" ");
    const multiplier = unit.startsWith("minute") ? 1 : unit.startsWith("hour") ? 60 : 1440;
    return parseInt(value) * multiplier;
}
