/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: formatValues.js			 */
/* Formats numbers into k/m/b/t or min/sec	 */
/* ----------------------------------------- */

// import { formatValue, formatValueTime, curTime, formatValueSec } from 'utility/formatValues.js';

export function formatValue(value) {
	// Format value to use k, m, b, or t for thousand/million/billion/trillion
	let newValue = value;

	if (value >= 1000000000000) {
		newValue = (value / 1000000000000).toPrecision(3) + "t";
	} else if (value >= 1000000000) {
		newValue = (value / 1000000000).toPrecision(3) + "b";
	} else if (value >= 1000000) {
		newValue = (value / 1000000).toPrecision(3) + "m";
	} else if (value >= 1000) {
		newValue = (value / 1000).toPrecision(3) + "k";
	} else {
		newValue = value.toPrecision(3); // No need for conversion if value < 1000
	}

	// Convert newValue to a string
	newValue = newValue.toString();

	return newValue;
}

export function formatValueTime(value) {
    if (isNaN(value) || value < 0) {
        return "Invalid Input";
    }

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;
    const formattedSeconds = seconds.toFixed(1);

    let formattedTime = '';

    if (hours > 0) {
        formattedTime += hours + 'h ';
    }

    if (minutes > 0) {
        formattedTime += minutes + 'm ';
    }

    if (formattedSeconds > 0 || formattedTime === '') {
        formattedTime += formattedSeconds + 's';
    }

    return formattedTime.trim();
}

export function curTime() {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

export function formatValueSec(value, isSecurity = false) {
	// Format value to use k, m, b, or t for thousand/million/billion/trillion
	let newValue = value;

	if (value >= 1000000000000) {
		newValue = (value / 1000000000000).toPrecision(3) + "t";
	} else if (value >= 1000000000) {
		newValue = (value / 1000000000).toPrecision(3) + "b";
	} else if (value >= 1000000) {
		newValue = (value / 1000000).toPrecision(3) + "m";
	} else if (value >= 1000) {
		newValue = (value / 1000).toPrecision(3) + "k";
	} else {
		newValue = value.toPrecision(3); // No need for conversion if value < 1000
	}

	if (isSecurity) {
		newValue = Math.round(Number(newValue)); // Convert newValue to a number before rounding
	}

	// Convert newValue to a string
	newValue = newValue.toString();

	// Determine the precision dynamically
	const precision = newValue.includes(".") ? newValue.split(".")[1].length : 0;
	const maxLength = isSecurity ? 3 : 5; // Adjust this value as needed
	const padding = maxLength - newValue.length;

	// Pad with spaces to ensure fixed length
	if (padding > 0) {
		newValue = " ".repeat(padding) + newValue;
	}

	return newValue;
}
