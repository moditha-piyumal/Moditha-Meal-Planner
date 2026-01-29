// =============================================
// 🎛️ PLAN MODE TOGGLE — Meal Abacus (FIXED)
// =============================================

const planBtn = document.getElementById("planBtn");
const doneBtn = document.getElementById("doneBtn");
const columns = document.querySelectorAll(".column");

// ENTER PLAN MODE
planBtn.addEventListener("click", () => {
	columns.forEach((column) => {
		column.classList.add("plan-mode");
	});

	planBtn.style.display = "none";
	doneBtn.hidden = false;
});

// EXIT PLAN MODE
doneBtn.addEventListener("click", () => {
	foods = [];

	columns.forEach((column, index) => {
		column.classList.remove("plan-mode");

		// 🔧 FIX: clear old inline hide
		const minusBtn = column.querySelector(".minus-btn");
		minusBtn.style.display = "";

		// ... rest of your existing code ...
	});

	doneBtn.hidden = true;
	planBtn.style.display = "inline-block";
});

// =============================================
// 🟡 ENTER PLAN MODE
// =============================================
planBtn.addEventListener("click", () => {
	columns.forEach((column) => {
		// Show plan inputs
		const planInputs = column.querySelector(".plan-inputs");
		planInputs.hidden = false;

		// Hide minus button
		const minusBtn = column.querySelector(".minus-btn");
		minusBtn.style.display = "none";
	});

	// Toggle top buttons
	planBtn.style.display = "none";
	doneBtn.hidden = false;
});
// =============================================
// 🧠 IN-MEMORY PLAN STATE
// =============================================

let foods = []; // one entry per column

// =============================================
// 🟢 EXIT PLAN MODE (DONE)
// =============================================

doneBtn.addEventListener("click", () => {
	foods = []; // reset plan

	columns.forEach((column, index) => {
		column.classList.remove("plan-mode");

		// Grab inputs
		const inputs = column.querySelectorAll(".plan-inputs input");

		const foodName = inputs[0].value || `Food ${index + 1}`;
		const totalServings = Number(inputs[1].value);
		const totalCalories = Number(inputs[2].value);
		let servingStep = Number(inputs[3].value);

		// =============================================
		// ✅ FIX 1: SANITIZE INPUTS
		// =============================================

		// Basic numeric validation
		if (
			!Number.isFinite(totalServings) ||
			totalServings <= 0 ||
			!Number.isFinite(totalCalories) ||
			totalCalories <= 0 ||
			!Number.isFinite(servingStep) ||
			servingStep <= 0
		) {
			console.warn(`Invalid plan for column ${index + 1}`);
			return;
		}

		// ❗ servingStep must NEVER exceed totalServings
		if (servingStep > totalServings) {
			alert(
				`Serving step cannot be bigger than total servings (column ${index + 1})`,
			);
			return;
		}

		// =============================================
		// 🧮 CALCULATIONS
		// =============================================

		const caloriesPerServing = totalCalories / totalServings;

		// Build food object
		const food = {
			name: foodName,
			totalServings,
			totalCalories,
			servingStep, // ✅ sanitized
			caloriesPerServing,
			consumedServings: 0,
		};

		foods[index] = food;

		// =============================
		// 🔄 UPDATE UI
		// =============================

		// Update name
		column.querySelector(".food-name").textContent = foodName;

		// Initialize remaining text (full amount)
		column.querySelector(".remaining").textContent =
			`Remaining: ${totalServings}/${totalServings} servings • ${totalCalories} kcal`;

		// Reset bar
		const barConsumed = column.querySelector(".bar-consumed");
		barConsumed.style.height = "0%";
	});

	doneBtn.hidden = true;
	planBtn.style.display = "inline-block";

	console.log("Plan set:", foods);
});

// =============================================
// ➖ MINUS BUTTON LOGIC — Consume Food
// =============================================

columns.forEach((column, index) => {
	const minusBtn = column.querySelector(".minus-btn");

	minusBtn.addEventListener("click", () => {
		const food = foods[index];

		// Guard: no plan set for this column
		if (!food) {
			console.warn(`No plan set for column ${index + 1}`);
			return;
		}

		// Increase consumed servings
		food.consumedServings += food.servingStep;

		// Clamp to total servings
		if (food.consumedServings > food.totalServings) {
			food.consumedServings = food.totalServings;
		}

		// Calculate calories
		const consumedCalories = food.consumedServings * food.caloriesPerServing;

		const remainingCalories = food.totalCalories - consumedCalories;

		// =================================
		// 🔄 UPDATE UI
		// =================================

		// Update remaining text
		column.querySelector(".remaining").textContent =
			`Remaining: ${Math.max(0, Math.round(remainingCalories))} kcal`;

		// Update bar height
		const percentageConsumed =
			(food.consumedServings / food.totalServings) * 100;

		column.querySelector(".bar-consumed").style.height =
			`${percentageConsumed}%`;

		console.log(
			`${food.name}: ${food.consumedServings}/${food.totalServings} servings`,
		);
	});
});
