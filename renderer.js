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
// 🔄 LOAD SAVED PLAN ON STARTUP
// =============================================

(async () => {
	const saved = await window.mealAPI.loadData();

	if (!saved || !saved.hasActivePlan || !Array.isArray(saved.foods)) {
		console.log("No active plan found.");
		return;
	}

	foods = [];

	columns.forEach((column, index) => {
		const food = saved.foods[index];
		if (!food) return;

		foods[index] = food;

		// Restore UI
		column.querySelector(".food-name").textContent = food.name;

		const caloriesPerServing = food.totalCalories / food.totalServings;

		const consumedCalories = food.consumedServings * caloriesPerServing;

		const remainingCalories = Math.max(
			0,
			Math.round(food.totalCalories - consumedCalories),
		);

		column.querySelector(".remaining").textContent =
			`Remaining: ${food.totalServings - food.consumedServings}/${food.totalServings} servings • ${remainingCalories} kcal`;

		column.querySelector(".bar-consumed").style.height =
			`${(food.consumedServings / food.totalServings) * 100}%`;
	});

	console.log("Plan restored from storage.");
})();

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
		let oneServing = Number(inputs[3].value);

		// =============================================
		// ✅ FIX 1: SANITIZE INPUTS
		// =============================================

		// Basic numeric validation
		if (
			!Number.isFinite(totalServings) ||
			totalServings <= 0 ||
			!Number.isFinite(totalCalories) ||
			totalCalories <= 0 ||
			!Number.isFinite(oneServing) ||
			oneServing <= 0
		) {
			console.warn(`Invalid plan for column ${index + 1}`);
			return;
		}

		// ❗ servingStep must NEVER exceed totalServings
		if (oneServing > totalServings) {
			alert(
				`One serving cannot be greater than total servings.\n\n` +
					`Column ${index + 1}: ${foodName}\n` +
					`Total servings: ${totalServings}\n` +
					`One serving: ${oneServing}`,
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
			oneServing, // ✅ renamed
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

	window.mealAPI.saveData({
		version: 1,
		hasActivePlan: true,
		foods,
	});
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
		food.consumedServings += food.oneServing;

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
		window.mealAPI.saveData({
			version: 1,
			hasActivePlan: true,
			foods,
		});
	});
});
