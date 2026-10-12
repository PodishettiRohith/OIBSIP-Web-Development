function convertTemperature() {

    const input = document.getElementById("temperature").value.trim();

    const unit = document.getElementById("unit").value;

    const error = document.getElementById("error");

    const celsiusResult = document.getElementById("celsius");
    const fahrenheitResult = document.getElementById("fahrenheit");
    const kelvinResult = document.getElementById("kelvin");


    // Clear previous error
    error.textContent = "";


    // Check empty input
    if (input === "") {
        error.textContent = "Please enter a temperature.";
        return;
    }


    // Check numeric input
    const temperature = Number(input);

    if (isNaN(temperature)) {
        error.textContent = "Please enter a valid number.";
        return;
    }


    let celsius;
    let fahrenheit;
    let kelvin;


    // Convert from Celsius
    if (unit === "Celsius") {

        celsius = temperature;

        fahrenheit = (celsius * 9 / 5) + 32;

        kelvin = celsius + 273.15;

    }


    // Convert from Fahrenheit
    else if (unit === "Fahrenheit") {

        fahrenheit = temperature;

        celsius = (fahrenheit - 32) * 5 / 9;

        kelvin = celsius + 273.15;

    }


    // Convert from Kelvin
    else if (unit === "Kelvin") {

        kelvin = temperature;

        celsius = kelvin - 273.15;

        fahrenheit = (celsius * 9 / 5) + 32;

    }


    // Absolute zero validation
    if (celsius < -273.15) {

        error.textContent =
            "Temperature cannot be below absolute zero (-273.15°C).";

        celsiusResult.textContent = "Celsius: --";
        fahrenheitResult.textContent = "Fahrenheit: --";
        kelvinResult.textContent = "Kelvin: --";

        return;
    }


    // Display results
    celsiusResult.textContent =
        "Celsius: " + celsius.toFixed(2) + " °C";

    fahrenheitResult.textContent =
        "Fahrenheit: " + fahrenheit.toFixed(2) + " °F";

    kelvinResult.textContent =
        "Kelvin: " + kelvin.toFixed(2) + " K";
}