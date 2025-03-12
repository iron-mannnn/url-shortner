//fetchShortenedURL Function Starts
const fetchShortenedURL = async () => {
  const response = await fetch("/links");
  const links = await response.json();
  console.log(links);

  const list = document.getElementById("shortened-urls");
  list.innerHTML = "";

  for (const [shortCode, url] of Object.entries(links)) {
    const li = document.createElement("li");
    li.innerHTML = `<a href="/${shortCode}" target="_blank">${window.location.origin}/${shortCode}</a> - ${url}`;
    list.appendChild(li);
  }
};
//fetchShortenedURL Function Ends

document
  .getElementById("shorten-url")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const url = formData.get("url");
    const shortCode = formData.get("shortCode");

    console.log(url, shortCode);

    // Fetch Data From BE Starts
    try {
      const response = await fetch("/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, shortCode }),
      });

      if (response.ok) {
        fetchShortenedURL(); //Showing data on UI
        alert("Form successfully");
        event.target.reset();
      } else {
        const errorMessage = await response.text();
        alert(errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
    // Fetch Data From BE Ends
  });

//Showing data on UI
fetchShortenedURL();
