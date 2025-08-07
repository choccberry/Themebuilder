document.addEventListener("DOMContentLoaded", () => {
    const addCarForm = document.getElementById("add-car-form");
    const listingsContainer = document.getElementById("listings-container");

    addCarForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const make = event.target.make.value;
        const model = event.target.model.value;
        const year = event.target.year.value;
        const price = event.target.price.value;
        const description = event.target.description.value;

        const listing = document.createElement("div");
        listing.classList.add("listing");

        listing.innerHTML = `
            <h3>${year} ${make} ${model}</h3>
            <p><strong>Price:</strong> $${price}</p>
            <p>${description}</p>
        `;

        listingsContainer.appendChild(listing);

        addCarForm.reset();
    });
});
