// =============================================
// 🧠 MEAL ABACUS — renderer.js (CLEAN)
// =============================================

// Top buttons
const planBtn = document.getElementById("planBtn");
const doneBtn = document.getElementById("doneBtn");

// Columns
const columns = document.querySelectorAll(".column");

// In-memory state (must exist BEFORE load runs)
let foods = []; // index = column index

// =============================================
// 🟡 ENTER PLAN MODE
// =============================================
// planBtn.addEventListener("click", () => {
// 	columns.forEach((column) => {
// 		column.classList.add("plan-mode");
// 		const planInputs = column.querySelector(".plan-inputs");
// 		if (planInputs) {
// 			planInputs.hidden = false;
// 		}
// 	});

// 	planBtn.style.display = "none";
// 	doneBtn.hidden = false;
// });
planBtn.addEventListener("click", async () => {
	// Check if a plan already exists
	const saved = await window.mealAPI.loadData();

	if (saved?.hasActivePlan) {
		const confirmed = confirm(
			"You already have an active monthly plan.\n\n" +
				"Starting a new plan will REPLACE it.\n\n" +
				"Do you want to continue?",
		);

		if (!confirmed) {
			return; // ⛔ Abort accidental reset
		}
	}

	// ✅ User confirmed (or no existing plan)
	columns.forEach((col) => col.classList.add("plan-mode"));
	planBtn.style.display = "none";
	doneBtn.hidden = false;
});

// =============================================
// 🟢 EXIT PLAN MODE (DONE) — Set plan + Save
// =============================================
doneBtn.addEventListener("click", () => {
	foods = Array.from({ length: columns.length }, () => null); // new plan overwrites old plan in memory

	for (let index = 0; index < columns.length; index++) {
		const column = columns[index];
		const defaultName = `Food ${index + 1}`;

		// Remove plan-mode (hides inputs via CSS)
		column.classList.remove("plan-mode");

		// Grab inputs for this column
		const inputs = column.querySelectorAll(".plan-inputs input");

		const foodName = inputs[0].value.trim() || defaultName;
		const totalServings = Number(inputs[1].value);
		const totalCalories = Number(inputs[2].value);
		const oneServing = Number(inputs[3].value);

		// Skip incomplete columns without blocking the rest
		if (
			!Number.isFinite(totalServings) ||
			totalServings <= 0 ||
			!Number.isFinite(totalCalories) ||
			totalCalories <= 0 ||
			!Number.isFinite(oneServing) ||
			oneServing <= 0
		) {
			console.warn(`Skipping column ${index + 1} — incomplete`);
			column.querySelector(".food-name").textContent = defaultName;
			column.querySelector(".remaining").textContent = "Remaining: -- kcal";
			column.querySelector(".bar-consumed").style.height = "0%";
			continue; // ⬅️ THIS IS THE FIX
		}

		if (oneServing > totalServings) {
			alert(
				`One serving cannot be greater than total servings.\n\n` +
					`Column ${index + 1}: ${foodName}\n` +
					`Total servings: ${totalServings}\n` +
					`One serving: ${oneServing}`,
			);
			column.querySelector(".food-name").textContent = defaultName;
			column.querySelector(".remaining").textContent = "Remaining: -- kcal";
			column.querySelector(".bar-consumed").style.height = "0%";
			continue; // stop plan set entirely (strict)
		}

		foods[index] = {
			name: foodName,
			totalServings,
			totalCalories,
			oneServing,
			consumedServings: 0,
		};

		// UI update
		column.querySelector(".food-name").textContent = foodName;
		column.querySelector(".remaining").textContent =
			`Remaining: ${totalServings}/${totalServings} servings • ${totalCalories} kcal`;
		column.querySelector(".bar-consumed").style.height = "0%";
	}

	// Toggle buttons
	doneBtn.hidden = true;
	planBtn.style.display = "inline-block";

	// ✅ Save snapshot
	if (window.mealAPI?.saveData) {
		const hasActivePlan = foods.some(Boolean);
		window.mealAPI.saveData({
			version: 1,
			hasActivePlan,
			foods,
		});
	} else {
		console.error("mealAPI not available — preload failed");
	}

	console.log("Plan set + saved:", foods);
});

// =============================================
// ➖ MINUS BUTTON LOGIC — Consume + Save
// =============================================
columns.forEach((column, index) => {
	const minusBtn = column.querySelector(".minus-btn");

	minusBtn.addEventListener("click", () => {
		const food = foods[index];

		if (!food) {
			console.warn(`No plan set for column ${index + 1}`);
			return;
		}

		// Consume
		food.consumedServings += food.oneServing;

		// Clamp
		if (food.consumedServings > food.totalServings) {
			food.consumedServings = food.totalServings;
		}

		// Derived calculations
		const caloriesPerServing = food.totalCalories / food.totalServings;
		const consumedCalories = food.consumedServings * caloriesPerServing;
		const remainingCalories = Math.max(
			0,
			Math.round(food.totalCalories - consumedCalories),
		);
		const remainingServings = Math.max(
			0,
			food.totalServings - food.consumedServings,
		);

		// UI update
		column.querySelector(".remaining").textContent =
			`Remaining: ${remainingServings}/${food.totalServings} servings • ${remainingCalories} kcal`;

		const percentageConsumed =
			(food.consumedServings / food.totalServings) * 100;
		column.querySelector(".bar-consumed").style.height =
			`${percentageConsumed}%`;

		// ✅ Save snapshot
		if (window.mealAPI?.saveData) {
			window.mealAPI.saveData({
				version: 1,
				hasActivePlan: true,
				foods,
			});
		} else {
			console.error("mealAPI not available — preload failed");
		}

		console.log(`${food.name}: ${food.consumedServings}/${food.totalServings}`);
	});
});

// =============================================
// 🔄 LOAD SAVED PLAN ON STARTUP (after foods exists)
// =============================================
(async () => {
	if (!window.mealAPI?.loadData) {
		console.error("mealAPI not available — preload failed");
		return;
	}

	const saved = await window.mealAPI.loadData();

	if (!saved || !saved.hasActivePlan || !Array.isArray(saved.foods)) {
		console.log("No active plan found.");
		return;
	}

	foods = saved.foods;

	columns.forEach((column, index) => {
		const food = foods[index];
		if (!food) return;

		const caloriesPerServing = food.totalCalories / food.totalServings;
		const consumedCalories = food.consumedServings * caloriesPerServing;
		const remainingCalories = Math.max(
			0,
			Math.round(food.totalCalories - consumedCalories),
		);
		const remainingServings = Math.max(
			0,
			food.totalServings - food.consumedServings,
		);

		column.querySelector(".food-name").textContent = food.name;
		column.querySelector(".remaining").textContent =
			`Remaining: ${remainingServings}/${food.totalServings} servings • ${remainingCalories} kcal`;

		const percentageConsumed =
			(food.consumedServings / food.totalServings) * 100;
		column.querySelector(".bar-consumed").style.height =
			`${percentageConsumed}%`;
	});

	console.log("Plan restored from storage:", foods);
})();
