import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
  headers: {
    "x-api-key": process.env.API_KEY,
    "Content-Type": "application/json; charset=utf-8"
  },
});

console.log("base url:", process.env.BASE_URL);
console.log("api key:", process.env.API_KEY);


axiosInstance.interceptors.request.use((config) => {
  console.log("Request sent:", config.url);
  document.body.style.cursor = "progress";
  progressBar.style.width = "0%";
  return config;
});

axiosInstance.interceptors.response.use((response) => {
  console.log("Response received:", response.config.url);
  document.body.style.cursor = "default";
  progressBar.style.width = "100%";
  return response;
}, (error) => {
  document.body.style.cursor = "default";
  progressBar.style.width = "0%";
  return Promise.reject(error);
});

const updateProgress = (progressEvent) => {
  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  progressBar.style.width = `${percentCompleted}%`;
};

let breedData = null;

const fetchBreeds = async () => {
  const response = await axiosInstance.get("/breeds/", {
    onDownloadProgress: updateProgress
  });
  console.log("Breeds fetched:", response.data);
  return response.status === 200 ? response.data : [];
}

const initialLoad = async () => {
  const response = await fetchBreeds();

  if (!response.length) {
    console.error("Failed to load breeds.");
    return;
  }
  breedData = response;

  response.forEach((breed) => {
    const option = document.createElement("option");
    option.value = breed.id;
    option.textContent = breed.name;
    breedSelect.appendChild(option);
  });

  breedSelection();
};

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

// Need to fix bootstraps carousel so it actually goes through the images

async function breedSelection() {
  const selectedBreedId = breedSelect.value;
  console.log("Selected breed:", selectedBreedId);

  try {
    const breedInfo = await fetchInfo(selectedBreedId);

    Carousel.clear();
    processBreed(breedInfo, selectedBreedId);
    Carousel.start();
  } catch (error) {
    console.error("Error loading breed information:", error);
  }
}

async function fetchInfo(selectedBreedId) {
  try {
    const response = await axiosInstance.get(`/images/search?breed_ids=${selectedBreedId}&limit=10`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch breed information: ${error.message}`);
    throw error;
  }
}

function processBreed(breedInfo, selectedBreedId) {
  infoDump.innerHTML = '';
  console.log("Breed id for processBreed:", selectedBreedId);

  const selectedBreed = breedData.find(breed => breed.id === Number(selectedBreedId));
  console.log(selectedBreed, "selectedBreed after find method");

  breedInfo.forEach((info) => {
    const carouselItem = Carousel.createCarouselItem(
      info.url,
      selectedBreed ? selectedBreed.name : "Unknown Breed",
      info.id
    );
    Carousel.appendCarousel(carouselItem);
  });

  if (selectedBreed) {
    const infoElement = createInfoElement(selectedBreed);
    infoDump.appendChild(infoElement);
  } else {
    console.log(selectedBreed, "breed information is missing.");
    console.warn("Breed information is missing for this image.");
  }
}
function createInfoElement(breedInfo) {
  const infoElement = document.createElement("div");
  let content = `<h2>${breedInfo.name}</h2>`;

  if (breedInfo.origin) {
    content += `<p><strong>Origin:</strong> ${breedInfo.origin}</p>`;
  }
  if (breedInfo.temperament) {
    content += `<p><strong>Temperament:</strong> ${breedInfo.temperament}</p>`;
  }
  if (breedInfo.bred_for) {
    content += `<p><strong>Bred For:</strong> ${breedInfo.bred_for}</p>`;
  }
  if (breedInfo.breed_group) {
    content += `<p><strong>Breed Group:</strong> ${breedInfo.breed_group}</p>`;
  }
  if (breedInfo.life_span) {
    content += `<p><strong>Life Span:</strong> ${breedInfo.life_span}</p>`;
  }
  if (breedInfo.height && breedInfo.height.imperial && breedInfo.height.metric) {
    content += `<p><strong>Height:</strong> ${breedInfo.height.imperial} inches (${breedInfo.height.metric} cm)</p>`;
  }
  if (breedInfo.weight && breedInfo.weight.imperial && breedInfo.weight.metric) {
    content += `<p><strong>Weight:</strong> ${breedInfo.weight.imperial} lbs (${breedInfo.weight.metric} kg)</p>`;
  }

  infoElement.innerHTML = content;
  return infoElement;
}

breedSelect.addEventListener("change", breedSelection);

initialLoad();

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */


/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */
 

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

/*
  "image_id":"id of the image",
  "sub_id":"optional unique id of your user"

  Probably need to grab the id of the image from the carousel, in other words the id of the event.target since createCarouselItem() returns a new element with that heart favourite is an event listener on.
  processBreed gives you the id of the image, so that may help
  https://api.thecatapi.com/v1/favourites is the api to post to favourites
*/

const deleteFavourite = async (favouriteId) => {
  try {
    const response = await axiosInstance.delete(`/favourites/${favouriteId}`);
    console.log("Deleted favourite", response);
    return response;
  } catch (error) {
    console.error("Failed to delete favourite:", error);
    throw error;
  }
};

let subId = 'my-user-1234';

export async function favourite(imgId) {
  try {
    const favouritesResponse = await axiosInstance.get("/favourites", {
      params: {
        sub_id: subId,
      },
    });

    const favourites = favouritesResponse.data;
    const existingFavourite = favourites.find(fav => fav.image_id === imgId);

    if (existingFavourite) {
      await deleteFavourite(existingFavourite.id);
    } else {
      const response = await axiosInstance.post("/favourites", {
        image_id: imgId,
        sub_id: subId,
      });
      console.log("Added to favourites", response);
    }
  } catch (error) {
    console.error("Failed to toggle favourite:", error);
  }
}


/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

const getFavourites = async () => {
  try {
    const response = await axiosInstance.get("/favourites", {
      params: {
        sub_id: subId,
        order: "DESC"
      }
    });

    Carousel.clear();

    response.data.forEach((favourite) => {
      const carouselItem = Carousel.createCarouselItem(
        favourite.image.url,
        "One of my favorite cats",
        favourite.id
      );
      Carousel.appendCarousel(carouselItem);
    });

    Carousel.start();
  } catch (error) {
    console.error("Failed to fetch favourites:", error);
  }
};

getFavouritesBtn.addEventListener("click", getFavourites);

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
