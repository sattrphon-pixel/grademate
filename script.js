const GPA_STORAGE_KEY = "grademate_courses";
const GPAX_STORAGE_KEY = "grademate_semesters";

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
    loadCourses();
    loadSemesters();

    updateCourseCount();
    updateSemesterCount();

    document
        .getElementById("courses")
        .addEventListener("input", saveCourses);

    document
        .getElementById("courses")
        .addEventListener("change", saveCourses);

    document
        .getElementById("semesters")
        .addEventListener("input", handleGPAXInput);

    document
        .getElementById("semesters")
        .addEventListener("change", handleSemesterChange);
});


/* =========================
   GPA
========================= */

function createCourse(
    subject = "",
    credit = "",
    grade = "4"
) {
    const course = document.createElement("div");

    course.className = "course";

    course.innerHTML = `
        <input
            type="text"
            class="subject"
            placeholder="เช่น Mathematics"
            aria-label="ชื่อวิชา"
            value="${escapeHTML(subject)}"
        >

        <input
            type="number"
            class="credit"
            placeholder="3"
            aria-label="หน่วยกิต"
            min="0.5"
            step="0.5"
            value="${escapeHTML(credit)}"
        >

        <select
            class="grade"
            aria-label="เกรด"
        >
            <option value="4" ${grade === "4" ? "selected" : ""}>A</option>
            <option value="3.5" ${grade === "3.5" ? "selected" : ""}>B+</option>
            <option value="3" ${grade === "3" ? "selected" : ""}>B</option>
            <option value="2.5" ${grade === "2.5" ? "selected" : ""}>C+</option>
            <option value="2" ${grade === "2" ? "selected" : ""}>C</option>
            <option value="1.5" ${grade === "1.5" ? "selected" : ""}>D+</option>
            <option value="1" ${grade === "1" ? "selected" : ""}>D</option>
            <option value="0" ${grade === "0" ? "selected" : ""}>F</option>
        </select>

        <button
            class="remove"
            type="button"
            onclick="removeCourse(this)"
            aria-label="ลบรายวิชา"
        >
            ×
        </button>
    `;

    document
        .getElementById("courses")
        .appendChild(course);
}


function addCourse() {
    createCourse();
    updateCourseCount();
    saveCourses();
}


function removeCourse(button) {
    const courses =
        document.querySelectorAll(".course");

    if (courses.length === 1) {
        return;
    }

    button.parentElement.remove();

    updateCourseCount();
    saveCourses();
}


function saveCourses() {
    const courses =
        document.querySelectorAll(".course");

    const data = [];

    courses.forEach(course => {
        data.push({
            subject:
                course.querySelector(".subject").value,

            credit:
                course.querySelector(".credit").value,

            grade:
                course.querySelector(".grade").value
        });
    });

    localStorage.setItem(
        GPA_STORAGE_KEY,
        JSON.stringify(data)
    );
}


function loadCourses() {
    const saved =
        localStorage.getItem(GPA_STORAGE_KEY);

    if (!saved) {
        createCourse();
        return;
    }

    try {
        const data = JSON.parse(saved);

        const courses =
            document.getElementById("courses");

        courses.innerHTML = "";

        data.forEach(course => {
            createCourse(
                course.subject,
                course.credit,
                course.grade
            );
        });

        if (data.length === 0) {
            createCourse();
        }

    } catch {
        localStorage.removeItem(GPA_STORAGE_KEY);
        createCourse();
    }
}


function calculateGPA() {
    const courses =
        document.querySelectorAll(".course");

    let totalPoints = 0;
    let totalCredits = 0;
    let validCourses = 0;

    const error =
        document.getElementById("error");

    error.textContent = "";

    courses.forEach(course => {

        const credit =
            parseFloat(
                course.querySelector(".credit").value
            );

        const grade =
            parseFloat(
                course.querySelector(".grade").value
            );

        if (
            isNaN(credit) ||
            credit <= 0
        ) {
            return;
        }

        totalPoints += credit * grade;
        totalCredits += credit;
        validCourses++;
    });

    if (validCourses === 0) {

        error.textContent =
            "กรุณากรอกหน่วยกิตอย่างน้อย 1 วิชา";

        return;
    }

    const gpa =
        totalPoints / totalCredits;

    document
        .getElementById("result")
        .textContent =
        gpa.toFixed(2);

    document
        .getElementById("totalCourses")
        .textContent =
        validCourses;

    document
        .getElementById("totalCredits")
        .textContent =
        totalCredits;

    saveCourses();
    updateDashboard();
}


function resetCourses() {

    const courses =
        document.getElementById("courses");

    courses.innerHTML = "";

    createCourse();

    localStorage.removeItem(
        GPA_STORAGE_KEY
    );

    document
        .getElementById("result")
        .textContent = "0.00";

    document
        .getElementById("totalCourses")
        .textContent = "0";

    document
        .getElementById("totalCredits")
        .textContent = "0";

    document
        .getElementById("error")
        .textContent = "";

    updateCourseCount();
}


function updateCourseCount() {

    const count =
        document.querySelectorAll(".course").length;

    document
        .getElementById("courseCount")
        .textContent =
        `${count} วิชา`;
}


/* =========================
   GPAX
========================= */

function createYearOptions(selected = 1) {

    let html = "";

    for (let year = 1; year <= 6; year++) {

        html += `
            <option
                value="${year}"
                ${Number(selected) === year ? "selected" : ""}
            >
                ${year}
            </option>
        `;
    }

    return html;
}


function createTermOptions(selected = 1) {

    let html = "";

    for (let term = 1; term <= 3; term++) {

        html += `
            <option
                value="${term}"
                ${Number(selected) === term ? "selected" : ""}
            >
                ${term}
            </option>
        `;
    }

    return html;
}


function createSemester(
    year = 1,
    term = 1,
    gpa = "",
    credit = ""
) {

    const semester =
        document.createElement("div");

    semester.className = "semester";

    semester.innerHTML = `

        <select
            class="semester-year"
            aria-label="ปีการศึกษา"
        >
            ${createYearOptions(year)}
        </select>

        <select
            class="semester-term"
            aria-label="ภาคการศึกษา"
        >
            ${createTermOptions(term)}
        </select>

        <input
            type="number"
            class="semester-gpa"
            placeholder="3.00"
            aria-label="GPA ของภาคการศึกษา"
            min="0"
            max="4"
            step="0.01"
            inputmode="decimal"
            value="${gpa}"
        >

        <input
            type="number"
            class="semester-credit"
            placeholder="18"
            aria-label="หน่วยกิตของภาคการศึกษา"
            min="0"
            step="0.5"
            value="${credit}"
        >

        <button
            class="remove"
            type="button"
            onclick="removeSemester(this)"
            aria-label="ลบภาคการศึกษา"
        >
            ×
        </button>
    `;

    document
        .getElementById("semesters")
        .appendChild(semester);
}


function getSemesterNumber(year, term) {

    return (
        (Number(year) - 1) * 3 +
        Number(term)
    );
}


function getUsedSemesters() {

    const semesters =
        document.querySelectorAll(".semester");

    const used = [];

    semesters.forEach(semester => {

        const year =
            semester.querySelector(
                ".semester-year"
            ).value;

        const term =
            semester.querySelector(
                ".semester-term"
            ).value;

        used.push(
            getSemesterNumber(year, term)
        );
    });

    return used;
}


function getNextAvailableSemester() {

    const used =
        getUsedSemesters();

    for (let number = 1; number <= 18; number++) {

        if (!used.includes(number)) {

            const year =
                Math.floor((number - 1) / 3) + 1;

            const term =
                ((number - 1) % 3) + 1;

            return {
                year,
                term
            };
        }
    }

    return null;
}


function addSemester() {

    const next =
        getNextAvailableSemester();

    if (!next) {

        document
            .getElementById("gpaxError")
            .textContent =
            "เพิ่มภาคการศึกษาได้สูงสุด 18 เทอม";

        return;
    }

    createSemester(
        next.year,
        next.term
    );

    sortSemesters();

    updateSemesterCount();

    saveSemesters();
}


function handleSemesterChange(event) {

    if (
        event.target.classList.contains(
            "semester-year"
        ) ||
        event.target.classList.contains(
            "semester-term"
        )
    ) {

        if (hasDuplicateSemester()) {

            alert(
                "ภาคการศึกษานี้มีอยู่แล้ว"
            );

            const semester =
                event.target.closest(".semester");

            const previousYear =
                semester.dataset.previousYear || "1";

            const previousTerm =
                semester.dataset.previousTerm || "1";

            semester.querySelector(
                ".semester-year"
            ).value = previousYear;

            semester.querySelector(
                ".semester-term"
            ).value = previousTerm;

        } else {

            rememberSemesterValues();
            sortSemesters();
        }
    }

    saveSemesters();
}


function rememberSemesterValues() {

    document
        .querySelectorAll(".semester")
        .forEach(semester => {

            semester.dataset.previousYear =
                semester.querySelector(
                    ".semester-year"
                ).value;

            semester.dataset.previousTerm =
                semester.querySelector(
                    ".semester-term"
                ).value;
        });
}


function hasDuplicateSemester() {

    const semesters =
        document.querySelectorAll(".semester");

    const used = new Set();

    for (const semester of semesters) {

        const year =
            semester.querySelector(
                ".semester-year"
            ).value;

        const term =
            semester.querySelector(
                ".semester-term"
            ).value;

        const number =
            getSemesterNumber(year, term);

        if (used.has(number)) {
            return true;
        }

        used.add(number);
    }

    return false;
}


function sortSemesters() {

    const container =
        document.getElementById("semesters");

    const semesters =
        Array.from(
            container.querySelectorAll(".semester")
        );

    semesters.sort((a, b) => {

        const aYear =
            a.querySelector(
                ".semester-year"
            ).value;

        const aTerm =
            a.querySelector(
                ".semester-term"
            ).value;

        const bYear =
            b.querySelector(
                ".semester-year"
            ).value;

        const bTerm =
            b.querySelector(
                ".semester-term"
            ).value;

        return (
            getSemesterNumber(aYear, aTerm) -
            getSemesterNumber(bYear, bTerm)
        );
    });

    semesters.forEach(semester => {
        container.appendChild(semester);
    });

    rememberSemesterValues();
}


function removeSemester(button) {

    const semesters =
        document.querySelectorAll(".semester");

    if (semesters.length === 1) {
        return;
    }

    button.parentElement.remove();

    updateSemesterCount();

    saveSemesters();
}


function handleGPAXInput(event) {

    if (
        event.target.classList.contains(
            "semester-gpa"
        )
    ) {

        let value =
            parseFloat(
                event.target.value
            );

        if (!isNaN(value)) {

            if (value > 4) {
                event.target.value = "4";
            }

            if (value < 0) {
                event.target.value = "0";
            }
        }
    }

    saveSemesters();
}


function saveSemesters() {

    const semesters =
        document.querySelectorAll(".semester");

    const data = [];

    semesters.forEach(semester => {

        data.push({

            year:
                semester.querySelector(
                    ".semester-year"
                ).value,

            term:
                semester.querySelector(
                    ".semester-term"
                ).value,

            gpa:
                semester.querySelector(
                    ".semester-gpa"
                ).value,

            credit:
                semester.querySelector(
                    ".semester-credit"
                ).value
        });
    });

    localStorage.setItem(
        GPAX_STORAGE_KEY,
        JSON.stringify(data)
    );
}


function loadSemesters() {

    const saved =
        localStorage.getItem(
            GPAX_STORAGE_KEY
        );

    if (!saved) {

        createSemester(1, 1);

        rememberSemesterValues();

        return;
    }

    try {

        const data =
            JSON.parse(saved);

        const container =
            document.getElementById(
                "semesters"
            );

        container.innerHTML = "";

        data.forEach(semester => {

            let year =
                semester.year;

            let term =
                semester.term;

            /*
                รองรับข้อมูลเก่าที่เคยเก็บ
                เป็น "ปี 1 เทอม 1"
            */

            if (
                year === undefined &&
                semester.name
            ) {

                const match =
                    semester.name.match(
                        /ปี\s*(\d+)\s*เทอม\s*(\d+)/
                    );

                if (match) {

                    year = match[1];
                    term = match[2];

                } else {

                    year = 1;
                    term = 1;
                }
            }

            createSemester(
                year || 1,
                term || 1,
                semester.gpa || "",
                semester.credit || ""
            );
        });

        if (data.length === 0) {
            createSemester(1, 1);
        }

        sortSemesters();

    } catch {

        localStorage.removeItem(
            GPAX_STORAGE_KEY
        );

        createSemester(1, 1);
    }
}


function calculateGPAX() {

    const semesters =
        document.querySelectorAll(".semester");

    let totalPoints = 0;
    let totalCredits = 0;
    let validSemesters = 0;

    const error =
        document.getElementById("gpaxError");

    error.textContent = "";

    semesters.forEach(semester => {

        let gpa =
            parseFloat(
                semester.querySelector(
                    ".semester-gpa"
                ).value
            );

        const credit =
            parseFloat(
                semester.querySelector(
                    ".semester-credit"
                ).value
            );

        if (
            isNaN(gpa) ||
            isNaN(credit) ||
            credit <= 0
        ) {
            return;
        }

        if (gpa > 4) {
            gpa = 4;
        }

        if (gpa < 0) {
            gpa = 0;
        }

        totalPoints +=
            gpa * credit;

        totalCredits +=
            credit;

        validSemesters++;
    });

    if (validSemesters === 0) {

        error.textContent =
            "กรุณากรอก GPA และหน่วยกิตอย่างน้อย 1 ภาคการศึกษา";

        return;
    }

    const gpax =
        totalPoints / totalCredits;

    document
        .getElementById("gpaxResult")
        .textContent =
        gpax.toFixed(2);

    document
        .getElementById("totalSemesters")
        .textContent =
        validSemesters;

    document
        .getElementById("totalGPAXCredits")
        .textContent =
        totalCredits;

    saveSemesters();
    updateDashboard();
}


function resetSemesters() {

    const semesters =
        document.getElementById(
            "semesters"
        );

    semesters.innerHTML = "";

    createSemester(1, 1);

    rememberSemesterValues();

    localStorage.removeItem(
        GPAX_STORAGE_KEY
    );

    document
        .getElementById("gpaxResult")
        .textContent = "0.00";

    document
        .getElementById("totalSemesters")
        .textContent = "0";

    document
        .getElementById("totalGPAXCredits")
        .textContent = "0";

    document
        .getElementById("gpaxError")
        .textContent = "";

    updateSemesterCount();
}


function updateSemesterCount() {

    const count =
        document.querySelectorAll(
            ".semester"
        ).length;

    document
        .getElementById("semesterCount")
        .textContent =
        `${count} เทอม`;
}


/* =========================
   Target GPA
========================= */

function calculateTargetGPA() {

    const currentGPAX = parseFloat(
        document.getElementById("currentGPAX").value
    );
    const completedCredits = parseFloat(
        document.getElementById("completedCredits").value
    );
    const nextCredits = parseFloat(
        document.getElementById("nextCredits").value
    );
    const targetGPAX = parseFloat(
        document.getElementById("targetGPAX").value
    );
    const error = document.getElementById("targetError");
    const result = document.getElementById("targetResult");
    const requiredGPAElement = document.getElementById("requiredGPA");
    const message = document.getElementById("targetMessage");

    error.textContent = "";
    result.style.display = "block";

    if ([currentGPAX, completedCredits, nextCredits, targetGPAX]
        .some(value => Number.isNaN(value))) {
        error.textContent = "กรุณากรอกข้อมูลให้ครบทุกช่อง";
        return;
    }

    if (currentGPAX < 0 || currentGPAX > 4) {
        error.textContent = "GPAX ปัจจุบันต้องอยู่ระหว่าง 0 ถึง 4";
        return;
    }

    if (targetGPAX < 0 || targetGPAX > 4) {
        error.textContent = "GPAX เป้าหมายต้องอยู่ระหว่าง 0 ถึง 4";
        return;
    }

    if (completedCredits < 0) {
        error.textContent = "หน่วยกิตที่เรียนแล้วไม่สามารถติดลบได้";
        return;
    }

    if (nextCredits <= 0) {
        error.textContent = "หน่วยกิตที่กำลังจะเรียนต้องมากกว่า 0";
        return;
    }

    const totalCredits = completedCredits + nextCredits;
    const requiredPoints =
        targetGPAX * totalCredits - currentGPAX * completedCredits;
    const required = requiredPoints / nextCredits;

    if (required > 4) {
        requiredGPAElement.textContent = "> 4.00";
        message.textContent =
            "เป้าหมายนี้ไม่สามารถทำได้ภายในเทอมเดียว เพราะต้องได้ GPA มากกว่า 4.00";
        return;
    }

    if (required <= 0) {
        requiredGPAElement.textContent = "0.00";
        message.textContent = "GPAX ปัจจุบันเพียงพอสำหรับเป้าหมายนี้แล้ว";
        return;
    }

    requiredGPAElement.textContent = required.toFixed(2);

    if (required >= 3.5) {
        message.textContent = "ต้องทำ GPA ค่อนข้างสูงในเทอมนี้";
    } else if (required >= 3) {
        message.textContent = "ต้องทำ GPA อย่างน้อยระดับ 3.00+";
    } else {
        message.textContent =
            "สามารถใช้ข้อมูลนี้เป็นเป้าหมาย GPA สำหรับเทอมถัดไปได้";
    }
}


/* =========================
   GRADE CALCULATOR
========================= */

const SCORE_STORAGE_KEY =
    "grademate_scores";

const GRADE_STORAGE_KEY =
    "grademate_target_grade";


const DEFAULT_GRADE_THRESHOLDS = {
    "A": 80,
    "B+": 75,
    "B": 70,
    "C+": 65,
    "C": 60,
    "D+": 55,
    "D": 50,
    "F": 0
};

let GRADE_THRESHOLDS = {
    ...DEFAULT_GRADE_THRESHOLDS
};

const GRADE_SETTINGS_KEY =
    "grademate_grade_thresholds";


document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadScores();
        loadGradeSettings();

        const savedGrade =
            localStorage.getItem(GRADE_STORAGE_KEY);

        if (savedGrade) {
            document
                .getElementById("targetGrade")
                .value = savedGrade;
        }

        updateScoreCount();
    }
);


function createScore(name = "", max = "", earned = "") {
    const row = document.createElement("div");

    row.className = "score-row";
    row.innerHTML = `
        <input
            type="text"
            class="score-name"
            placeholder="เช่น คะแนนเก็บ"
            aria-label="รายการคะแนน"
            value="${escapeHTML(name)}"
        >

        <input
            type="number"
            class="score-max"
            placeholder="30"
            aria-label="คะแนนเต็ม"
            min="0"
            step="0.01"
            value="${escapeHTML(max)}"
        >

        <input
            type="number"
            class="score-earned"
            placeholder="25"
            aria-label="คะแนนที่ได้"
            min="0"
            step="0.01"
            value="${escapeHTML(earned)}"
        >

        <button
            class="remove"
            type="button"
            onclick="removeScore(this)"
            aria-label="ลบรายการคะแนน"
        >
            ×
        </button>
    `;

    document
        .getElementById("scores")
        .appendChild(row);
}


function addScore() {
    createScore();
    updateScoreCount();
    saveScores();
}


function removeScore(button) {
    const rows =
        document.querySelectorAll(".score-row");

    if (rows.length === 1) {
        return;
    }

    button.parentElement.remove();
    updateScoreCount();
    saveScores();
}


function updateScoreCount() {
    const count =
        document.querySelectorAll(".score-row").length;

    document
        .getElementById("scoreCount")
        .textContent = `${count} ส่วน`;
}


function saveScores() {
    const rows =
        document.querySelectorAll(".score-row");
    const data = [];

    rows.forEach(row => {
        data.push({
            name: row.querySelector(".score-name").value,
            max: row.querySelector(".score-max").value,
            earned: row.querySelector(".score-earned").value
        });
    });

    localStorage.setItem(
        SCORE_STORAGE_KEY,
        JSON.stringify(data)
    );

    const targetGrade =
        document.getElementById("targetGrade");

    if (targetGrade) {
        localStorage.setItem(
            GRADE_STORAGE_KEY,
            targetGrade.value
        );
    }
}


function loadScores() {
    const saved =
        localStorage.getItem(SCORE_STORAGE_KEY);
    const container = document.getElementById("scores");

    container.innerHTML = "";

    if (!saved) {
        createDefaultScores();
        return;
    }

    try {
        const data = JSON.parse(saved);

        data.forEach(score => {
            createScore(
                score.name,
                score.max,
                score.earned
            );
        });

        if (data.length === 0) {
            createDefaultScores();
        }
    } catch {
        localStorage.removeItem(SCORE_STORAGE_KEY);
        createDefaultScores();
    }
}


function createDefaultScores() {
    createScore("คะแนนเก็บ", 30, "");
    createScore("กลางภาค", 30, "");
    createScore("ปลายภาค", 40, "");
}


function calculateGrade() {
    const rows = document.querySelectorAll(".score-row");
    const targetGrade = document.getElementById("targetGrade").value;
    const error = document.getElementById("gradeError");

    error.textContent = "";

    let current = 0;
    let total = 0;
    let hasData = false;

    for (const row of rows) {
        const max = parseFloat(
            row.querySelector(".score-max").value
        );
        let earned = parseFloat(
            row.querySelector(".score-earned").value
        );

        if (Number.isNaN(max) || max <= 0) {
            continue;
        }

        hasData = true;

        if (Number.isNaN(earned)) {
            earned = 0;
        }

        if (earned < 0) {
            earned = 0;
        }

        if (earned > max) {
            error.textContent =
                "คะแนนที่ได้ไม่สามารถมากกว่าคะแนนเต็มได้";
            return;
        }

        current += earned;
        total += max;
    }

    if (!hasData) {
        error.textContent =
            "กรุณากรอกคะแนนเต็มอย่างน้อย 1 รายการ";
        return;
    }

    const percentage =
        total > 0 ? (current / total) * 100 : 0;
    const threshold = GRADE_THRESHOLDS[targetGrade];
    const targetScore = (threshold / 100) * total;
    const required = targetScore - current;
    const remaining = total - current;
    const requiredPercent =
        remaining > 0 ? (required / remaining) * 100 : 0;

    document.getElementById("currentScore").textContent =
        formatNumber(current);
    document.getElementById("totalScore").textContent =
        formatNumber(total);
    document.getElementById("scorePercent").textContent =
        `${percentage.toFixed(2)}%`;
    document.getElementById("remainingScore").textContent =
        formatNumber(Math.max(remaining, 0));

    const requiredElement = document.getElementById("requiredScore");
    const requiredTitle = document.getElementById("requiredTitle");
    const message = document.getElementById("gradeMessage");
    const requiredPercentElement =
        document.getElementById("requiredPercent");
    const status = document.getElementById("gradeStatus");

    status.className = "grade-status";

    if (required <= 0) {
        requiredTitle.textContent = `คะแนนสำหรับ ${targetGrade}`;
        requiredElement.textContent = "ถึงแล้ว";
        requiredPercentElement.textContent = "0%";
        message.textContent =
            `คะแนนปัจจุบันถึงเกณฑ์ ${targetGrade} แล้ว`;
        status.classList.add("success");
        status.textContent =
            `✓ ตอนนี้คะแนนของคุณถึงเกณฑ์ ${targetGrade} แล้ว`;
    } else if (remaining <= 0) {
        requiredTitle.textContent = `คะแนนสำหรับ ${targetGrade}`;
        requiredElement.textContent = formatNumber(required);
        requiredPercentElement.textContent = "—";
        message.textContent = "ไม่มีคะแนนเหลือให้เก็บแล้ว";
        status.classList.add("danger");
        status.textContent =
            `✕ ไม่สามารถเพิ่มคะแนนเพื่อให้ถึง ${targetGrade} ได้แล้ว`;
    } else if (requiredPercent > 100) {
        requiredTitle.textContent =
            `ต้องได้เพิ่มเพื่อให้ถึง ${targetGrade}`;
        requiredElement.textContent = formatNumber(required);
        requiredPercentElement.textContent =
            `${requiredPercent.toFixed(2)}%`;
        message.textContent =
            `คะแนนที่เหลือมีเพียง ${formatNumber(remaining)} คะแนน`;
        status.classList.add("danger");
        status.textContent =
            "✕ เป้าหมายนี้ไม่สามารถทำได้จากคะแนนที่เหลือ";
    } else if (requiredPercent >= 85) {
        requiredTitle.textContent =
            `ต้องได้เพิ่มเพื่อให้ถึง ${targetGrade}`;
        requiredElement.textContent = formatNumber(required);
        requiredPercentElement.textContent =
            `${requiredPercent.toFixed(2)}%`;
        message.textContent =
            `ต้องทำ ${requiredPercent.toFixed(2)}% ของคะแนนที่เหลือ`;
        status.classList.add("warning");
        status.textContent =
            "⚠ ต้องทำคะแนนส่วนที่เหลือค่อนข้างสูง";
    } else if (requiredPercent >= 60) {
        requiredTitle.textContent =
            `ต้องได้เพิ่มเพื่อให้ถึง ${targetGrade}`;
        requiredElement.textContent = formatNumber(required);
        requiredPercentElement.textContent =
            `${requiredPercent.toFixed(2)}%`;
        message.textContent =
            `ต้องทำ ${requiredPercent.toFixed(2)}% ของคะแนนที่เหลือ`;
        status.classList.add("warning");
        status.textContent =
            "ต้องทำคะแนนส่วนที่เหลือให้ได้ตามเป้าหมาย";
    } else {
        requiredTitle.textContent =
            `ต้องได้เพิ่มเพื่อให้ถึง ${targetGrade}`;
        requiredElement.textContent = formatNumber(required);
        requiredPercentElement.textContent =
            `${requiredPercent.toFixed(2)}%`;
        message.textContent =
            `ต้องทำ ${requiredPercent.toFixed(2)}% ของคะแนนที่เหลือ`;
        status.classList.add("success");
        status.textContent =
            "✓ เป้าหมายยังอยู่ในระดับที่ทำได้จากคะแนนที่เหลือ";
    }

    saveScores();
}


function formatNumber(number) {
    if (Number.isInteger(number)) {
        return number.toString();
    }

    return number.toFixed(2);
}


function updateDashboard() {
    const gpaElement = document.getElementById("dashboardGPA");
    const gpaxElement = document.getElementById("dashboardGPAX");
    const countElement = document.getElementById("dashboardDataCount");

    if (!gpaElement || !gpaxElement || !countElement) {
        return;
    }

    let latestGPA = null;

    if (typeof gradeHistory !== "undefined" && gradeHistory.length > 0) {
        const latest = gradeHistory[gradeHistory.length - 1];
        latestGPA = latest.gpa;
    }

    const gpax = getHistoryGPAX();
    const semesterCount =
        typeof gradeHistory !== "undefined"
            ? gradeHistory.length
            : 0;

    gpaElement.textContent =
        latestGPA !== null ? latestGPA.toFixed(2) : "-";
    gpaxElement.textContent =
        gpax !== null ? gpax.toFixed(2) : "-";
    countElement.textContent =
        semesterCount > 0 ? `${semesterCount} เทอม` : "-";
}


document.addEventListener("DOMContentLoaded", () => {
    updateDashboard();

    const backToTop = document.getElementById("backToTop");

    if (!backToTop) {
        return;
    }

    const updateBackToTop = () => {
        backToTop.classList.toggle(
            "show",
            window.scrollY > 500
        );
    };

    window.addEventListener("scroll", updateBackToTop);
    updateBackToTop();
});


/* =========================
   GRADE SETTINGS
========================= */

function loadGradeSettings() {
    const saved = localStorage.getItem(GRADE_SETTINGS_KEY);

    if (!saved) {
        GRADE_THRESHOLDS = { ...DEFAULT_GRADE_THRESHOLDS };
        updateGradeSettingInputs();
        return;
    }

    try {
        const data = JSON.parse(saved);

        GRADE_THRESHOLDS = {
            ...DEFAULT_GRADE_THRESHOLDS,
            ...data
        };

        updateGradeSettingInputs();
    } catch {
        GRADE_THRESHOLDS = { ...DEFAULT_GRADE_THRESHOLDS };
        updateGradeSettingInputs();
    }
}


function updateGradeSettingInputs() {
    const inputIds = {
        "A": "threshold-A",
        "B+": "threshold-Bplus",
        "B": "threshold-B",
        "C+": "threshold-Cplus",
        "C": "threshold-C",
        "D+": "threshold-Dplus",
        "D": "threshold-D",
        "F": "threshold-F"
    };

    Object.entries(inputIds).forEach(([grade, id]) => {
        const input = document.getElementById(id);
        input.value = GRADE_THRESHOLDS[grade];
        input.setAttribute("aria-label", `เกณฑ์เกรด ${grade}`);
    });
}


function openGradeSettings() {
    updateGradeSettingInputs();
    document.getElementById("settingsError").textContent = "";
    document.getElementById("gradeSettingsModal").classList.add("show");
}


function closeGradeSettings() {
    document.getElementById("gradeSettingsModal").classList.remove("show");
}


function saveGradeSettings() {
    const inputIds = {
        "A": "threshold-A",
        "B+": "threshold-Bplus",
        "B": "threshold-B",
        "C+": "threshold-Cplus",
        "C": "threshold-C",
        "D+": "threshold-Dplus",
        "D": "threshold-D",
        "F": "threshold-F"
    };
    const grades = Object.keys(inputIds);
    const values = {};

    grades.forEach(grade => {
        values[grade] = parseFloat(
            document.getElementById(inputIds[grade]).value
        );
    });

    const error = document.getElementById("settingsError");

    if (grades.some(grade =>
        Number.isNaN(values[grade]) ||
        values[grade] < 0 ||
        values[grade] > 100
    )) {
        error.textContent = "คะแนนเกณฑ์ต้องอยู่ระหว่าง 0 ถึง 100";
        return;
    }

    for (let index = 1; index < grades.length; index++) {
        if (values[grades[index - 1]] < values[grades[index]]) {
            error.textContent = "เกณฑ์เกรดต้องเรียงจาก A ลงไปหา F";
            return;
        }
    }

    GRADE_THRESHOLDS = values;
    localStorage.setItem(
        GRADE_SETTINGS_KEY,
        JSON.stringify(values)
    );

    closeGradeSettings();
    calculateGrade();
}


function resetGradeSettings() {
    GRADE_THRESHOLDS = { ...DEFAULT_GRADE_THRESHOLDS };
    localStorage.removeItem(GRADE_SETTINGS_KEY);
    updateGradeSettingInputs();
    document.getElementById("settingsError").textContent = "";
}


/* =========================
   SEMESTER HISTORY
========================= */

const HISTORY_STORAGE_KEY = "grademate_history";

let gradeHistory = [];


function loadHistory() {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!saved) {
        gradeHistory = [];
        renderHistory();
        return;
    }

    try {
        const data = JSON.parse(saved);

        gradeHistory = Array.isArray(data)
            ? data
                .filter(item => {
                    const gpa = Number(item?.gpa);
                    const credits = Number(item?.credits);

                    return item &&
                        ["1", "2", "3", "4", "5", "6"]
                            .includes(String(item.year)) &&
                        ["1", "2", "3"]
                            .includes(String(item.semester)) &&
                        Number.isFinite(gpa) &&
                        gpa >= 0 &&
                        gpa <= 4 &&
                        Number.isFinite(credits) &&
                        credits > 0;
                })
                .map((item, index) => ({
                    id: Number.isFinite(Number(item.id))
                        ? Number(item.id)
                        : Date.now() + index,
                    year: String(item.year),
                    semester: String(item.semester),
                    gpa: Number(Number(item.gpa).toFixed(2)),
                    credits: Number(item.credits)
                }))
            : [];
    } catch {
        gradeHistory = [];
    }

    sortHistory();
    renderHistory();
}


function saveHistory() {
    localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(gradeHistory)
    );
}


function addHistory() {
    const year = document.getElementById("historyYear").value;
    const semester = document.getElementById("historySemester").value;
    const gpaInput = document.getElementById("historyGPA");
    const creditsInput = document.getElementById("historyCredits");
    const error = document.getElementById("historyError");
    const gpa = parseFloat(gpaInput.value);
    const credits = parseFloat(creditsInput.value);

    error.textContent = "";

    if (Number.isNaN(gpa)) {
        error.textContent = "กรุณากรอก GPA";
        return;
    }

    if (gpa < 0 || gpa > 4) {
        error.textContent = "GPA ต้องอยู่ระหว่าง 0.00 - 4.00";
        gpaInput.value = Math.min(4, Math.max(0, gpa));
        return;
    }

    if (Number.isNaN(credits)) {
        error.textContent = "กรุณากรอกจำนวนหน่วยกิต";
        return;
    }

    if (credits <= 0) {
        error.textContent = "หน่วยกิตต้องมากกว่า 0";
        return;
    }

    const duplicate = gradeHistory.find(item =>
        item.year === year && item.semester === semester
    );

    if (duplicate) {
        error.textContent =
            `ปี ${year} เทอม ${semester} มีข้อมูลอยู่แล้ว`;
        return;
    }

    gradeHistory.push({
        id: Date.now(),
        year,
        semester,
        gpa: Number(gpa.toFixed(2)),
        credits
    });

    sortHistory();
    saveHistory();
    renderHistory();
    drawGPAChart();
    updateGPAInsights();
    updateDashboard();

    gpaInput.value = "";
    creditsInput.value = "";
}


function deleteHistory(id) {
    gradeHistory = gradeHistory.filter(item => item.id !== id);
    saveHistory();
    renderHistory();
    drawGPAChart();
    updateGPAInsights();
    updateDashboard();
}


function sortHistory() {
    gradeHistory.sort((a, b) => {
        const yearDifference = Number(a.year) - Number(b.year);

        if (yearDifference !== 0) {
            return yearDifference;
        }

        return Number(a.semester) - Number(b.semester);
    });
}


function getSemesterName(semester) {
    if (semester === "1") {
        return "เทอม 1";
    }

    if (semester === "2") {
        return "เทอม 2";
    }

    return "ภาคฤดูร้อน";
}


function renderHistory() {
    const list = document.getElementById("historyList");
    const count = document.getElementById("historyCount");
    const latest = document.getElementById("historyLatestGPA");
    const gpaxElement = document.getElementById("historyGPAX");

    if (!list) {
        return;
    }

    count.textContent = gradeHistory.length;

    if (gradeHistory.length === 0) {
        latest.textContent = "-";
        gpaxElement.textContent = "-";
        list.innerHTML = `
            <div class="history-empty">
                ยังไม่มีประวัติการเรียน
            </div>
        `;
        updateGPAInsights();
        updateDashboard();
        return;
    }

    const latestItem = gradeHistory[gradeHistory.length - 1];
    latest.textContent = Number(latestItem.gpa).toFixed(2);

    const gpax = getHistoryGPAX();

    gpaxElement.textContent = gpax !== null
        ? gpax.toFixed(2)
        : "-";
    list.innerHTML = "";

    gradeHistory.forEach(item => {
        const row = document.createElement("div");

        row.className = "history-item";
        row.innerHTML = `
            <div class="history-year">
                ปี ${escapeHTML(item.year)}
            </div>

            <div>
                <div class="history-semester">
                    ${escapeHTML(getSemesterName(item.semester))}
                </div>

                <div class="history-credits">
                    ${escapeHTML(item.credits)} หน่วยกิต
                </div>
            </div>

            <div class="history-gpa">
                ${escapeHTML(Number(item.gpa).toFixed(2))}
            </div>

            <button
                class="history-delete"
                type="button"
                title="ลบ"
                aria-label="ลบประวัติปี ${escapeHTML(item.year)} ${escapeHTML(getSemesterName(item.semester))}"
            >
                ×
            </button>
        `;

        row
            .querySelector(".history-delete")
            .addEventListener("click", () => deleteHistory(item.id));

        list.appendChild(row);
    });

    updateGPAInsights();
    updateDashboard();
}


function getHistoryGPAX() {
    if (gradeHistory.length === 0) {
        return null;
    }

    let totalPoints = 0;
    let totalCredits = 0;

    gradeHistory.forEach(item => {
        totalPoints += Number(item.gpa) * Number(item.credits);
        totalCredits += Number(item.credits);
    });

    if (totalCredits <= 0) {
        return null;
    }

    return Math.min(
        4,
        totalPoints / totalCredits
    );
}


document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
    drawGPAChart();
    updateGPAInsights();
});


/* =========================
   GPA CHART
========================= */

function drawGPAChart() {
    const canvas = document.getElementById("gpaChart");
    const empty = document.getElementById("chartEmpty");

    if (!canvas || !empty) {
        return;
    }

    const ctx = canvas.getContext("2d");

    if (gradeHistory.length === 0) {
        empty.style.display = "flex";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    empty.style.display = "none";

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;
    const padding = {
        top: 20,
        right: 20,
        bottom: 45,
        left: 40
    };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let value = 0; value <= 4; value++) {
        const y = padding.top + chartHeight -
            (value / 4) * chartHeight;

        ctx.fillStyle = "#6b7280";
        ctx.fillText(value.toFixed(1), padding.left - 10, y);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    const points = gradeHistory.map((item, index) => {
        const x = gradeHistory.length === 1
            ? padding.left + chartWidth / 2
            : padding.left +
                (index / (gradeHistory.length - 1)) * chartWidth;
        const y = padding.top + chartHeight -
            (item.gpa / 4) * chartHeight;

        return {
            x,
            y,
            gpa: item.gpa,
            label: `ปี ${item.year} ${getSemesterName(item.semester)}`
        };
    });

    if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let index = 1; index < points.length; index++) {
            ctx.lineTo(points[index].x, points[index].y);
        }

        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();
    }

    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "#111827";
        ctx.fillText(point.gpa.toFixed(2), point.x, point.y - 10);
    });

    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    points.forEach(point => {
        ctx.fillStyle = "#6b7280";
        ctx.fillText(
            point.label,
            point.x,
            height - padding.bottom + 12
        );
    });
}


window.addEventListener("resize", () => {
    drawGPAChart();
});


/* =========================
   GPA INSIGHTS
========================= */

function updateGPAInsights() {
    const latestElement = document.getElementById("insightLatest");
    const highestElement = document.getElementById("insightHighest");
    const lowestElement = document.getElementById("insightLowest");
    const trendElement = document.getElementById("gpaTrend");

    if (
        !latestElement ||
        !highestElement ||
        !lowestElement ||
        !trendElement
    ) {
        return;
    }

    if (gradeHistory.length === 0) {
        latestElement.textContent = "-";
        highestElement.textContent = "-";
        lowestElement.textContent = "-";
        trendElement.className = "gpa-trend empty";
        trendElement.textContent = "";
        return;
    }

    const gpas = gradeHistory.map(item => Number(item.gpa));
    const latest = gpas[gpas.length - 1];
    const highest = Math.max(...gpas);
    const lowest = Math.min(...gpas);

    latestElement.textContent = latest.toFixed(2);
    highestElement.textContent = highest.toFixed(2);
    lowestElement.textContent = lowest.toFixed(2);

    if (gradeHistory.length < 2) {
        trendElement.className = "gpa-trend same";
        trendElement.textContent =
            "📊 มีข้อมูลเพียง 1 เทอม ยังไม่มีข้อมูลสำหรับเปรียบเทียบแนวโน้ม";
        return;
    }

    const previous = gpas[gpas.length - 2];
    const difference = latest - previous;
    const roundedDifference = Math.abs(difference).toFixed(2);

    if (difference > 0) {
        trendElement.className = "gpa-trend up";
        trendElement.textContent =
            `📈 GPA เพิ่มขึ้น ${roundedDifference} คะแนนจากเทอมก่อน`;
    } else if (difference < 0) {
        trendElement.className = "gpa-trend down";
        trendElement.textContent =
            `📉 GPA ลดลง ${roundedDifference} คะแนนจากเทอมก่อน`;
    } else {
        trendElement.className = "gpa-trend same";
        trendElement.textContent = "➡️ GPA เท่ากับเทอมก่อน";
    }
}


/* =========================
   BACKUP
========================= */

function exportGradeMateData() {
    const data = {};

    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);

        if (key && key.startsWith("grademate_")) {
            data[key] = localStorage.getItem(key);
        }
    }

    const backup = {
        app: "GradeMate",
        version: 1,
        exportedAt: new Date().toISOString(),
        data
    };
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `grademate-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showBackupStatus(
        "success",
        "✅ สำรองข้อมูลเรียบร้อยแล้ว"
    );
}


function importGradeMateData(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
        try {
            const backup = JSON.parse(loadEvent.target.result);

            if (
                !backup ||
                backup.app !== "GradeMate" ||
                !backup.data ||
                typeof backup.data !== "object"
            ) {
                throw new Error(
                    "ไฟล์นี้ไม่ใช่ไฟล์สำรองของ GradeMate"
                );
            }

            const confirmed = confirm(
                "การ Import จะเขียนทับข้อมูล GradeMate ที่มีอยู่ในเครื่องตอนนี้\n\n" +
                "ต้องการดำเนินการต่อหรือไม่?"
            );

            if (!confirmed) {
                event.target.value = "";
                return;
            }

            for (let index = localStorage.length - 1; index >= 0; index--) {
                const key = localStorage.key(index);

                if (key && key.startsWith("grademate_")) {
                    localStorage.removeItem(key);
                }
            }

            Object.keys(backup.data).forEach(key => {
                if (key.startsWith("grademate_")) {
                    localStorage.setItem(key, backup.data[key]);
                }
            });

            if (typeof loadHistory === "function") {
                loadHistory();
            }

            if (typeof loadScores === "function") {
                loadScores();
            }

            if (typeof loadGradeSettings === "function") {
                loadGradeSettings();
            }

            if (typeof updateGradeSettingInputs === "function") {
                updateGradeSettingInputs();
            }

            if (typeof drawGPAChart === "function") {
                drawGPAChart();
            }

            if (typeof updateGPAInsights === "function") {
                updateGPAInsights();
            }

            if (typeof updateDashboard === "function") {
                updateDashboard();
            }

            showBackupStatus(
                "success",
                "✅ Import ข้อมูลเรียบร้อยแล้ว"
            );
        } catch (error) {
            showBackupStatus(
                "error",
                "❌ ไม่สามารถ Import ไฟล์นี้ได้: " + error.message
            );
        }

        event.target.value = "";
    };

    reader.readAsText(file);
}


function showBackupStatus(type, message) {
    const status = document.getElementById("backupStatus");

    if (!status) {
        return;
    }

    status.className = `backup-status ${type}`;
    status.textContent = message;

    setTimeout(() => {
        status.textContent = "";
        status.className = "backup-status";
    }, 4000);
}