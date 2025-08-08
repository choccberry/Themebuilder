document.addEventListener("DOMContentLoaded", () => {
    const addCarForm = document.getElementById("add-car-form");
    const listingsContainer = document.getElementById("listings-container");
    const makeSelect = document.getElementById("make");
    const makeSearchSelect = document.getElementById("make-search");
    const locationSelect = document.getElementById("location");
    const locationAddSelect = document.getElementById("location-add");

    const API_URL = 'http://localhost:3000/api';

    async function fetchAndPopulate(endpoint, selectElement, placeholder) {
        try {
            const response = await fetch(`${API_URL}/${endpoint}`);
            const data = await response.json();
            selectElement.innerHTML = `<option value="">${placeholder}</option>`;
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
        }
    }

    async function fetchListings() {
        try {
            const response = await fetch(`${API_URL}/cars`);
            const listings = await response.json();
            listingsContainer.innerHTML = '';
            listings.forEach(listing => {
                const listingElement = document.createElement("div");
                listingElement.classList.add("listing");
                listingElement.innerHTML = `
                    <h3>${listing.year} ${listing.make} ${listing.model}</h3>
                    <p><strong>Price:</strong> ₦${listing.price.toLocaleString()}</p>
                    <p><strong>Location:</strong> ${listing.location}</p>
                    <p>${listing.description}</p>
                    <img src="${listing.image}" alt="${listing.make} ${listing.model}" style="max-width: 100%;">
                `;
                listingsContainer.appendChild(listingElement);
            });
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        }
    }

    fetchAndPopulate('cars/makes', makeSelect, "Select a make");
    fetchAndPopulate('cars/makes', makeSearchSelect, "Any Make");
    fetchAndPopulate('locations', locationSelect, "Any Location");
    fetchAndPopulate('locations', locationAddSelect, "Select a location");

    addCarForm.addEventListener("submit", (event) => {
        event.preventDefault();
        // Logic to add a new car will be implemented here
        // This will involve sending a POST request to the backend
        addCarForm.reset();
    });

    // Initial fetch of listings
    fetchListings();
});


