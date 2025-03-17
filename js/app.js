const repoUrl = document.getElementById("repo-input")


repoUrl.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    generatePreview();
  }
});


/**
 * Function that generates a preview of a GitHub repository based on a URL input.
 *
 * @returns {Promise<void>} does not return anything but creates a preview for the repository.
 */
async function generatePreview() {
  //Wait until the 'Tektur' font is loaded
  await document.fonts.load("10px 'Tektur'")


  const
    /**
     * Validate the input URL and extract the owner and repo names.
     * @type {RegExpMatchArray}
     */
    match = repoUrl.value.trim().match(/github\.com\/(.+)\/(.+)/);

  if (!match) {
    alert("Please enter a valid GitHub repository URL.");
    return
  }


  const
    /**
     * Destructuring the matched values.
     */
    [_, owner, repo] = match,
    /**
     * GitHub API URL.
     * @type {string}
     */
    github_api_url = `https://api.github.com/repos/${owner}/${repo}`,
    /**
     * Response from GitHub API URL.
     * @type {Response}
     */
    response = await fetch(github_api_url);

  if (!response.ok) {
    alert(`Error: Unable to fetch repository data.`);
    return;
  }


  const
    /**
     * Data from GitHub response.
     */
    data = await response.json(),
    /**
     * GitHub username.
     */
    username = data.owner.login,
    /**
     * GitHub repository name.
     */
    repository_name = data.name,
    /**
     * GitHub repository description.
     * @type {string | AllowSharedBufferSource}
     */
    description = data.description,
    /**
     * GitHub avatar URL.
     */
    avatar_url = data.owner.avatar_url,
    /**
     * GitHub avatar response.
     * @type {Response}
     */
    avatar_image_response = await fetch(avatar_url),
    /**
     * GitHub avatar blob.
     * @type {Blob}
     */
    avatar_image_blob = await avatar_image_response.blob(),
    /**
     * URL string that represents the Blob object and can be used to retrieve the Blob later.
     * @type {string}
     */
    avatar_image_objectURL = URL.createObjectURL(avatar_image_blob);


  //Generate preview
  createPreview(username, repository_name, description, avatar_image_objectURL);
}


/**
 * Function that generates a font string with the specified font size.
 *
 * @param font_size the font size.
 * @returns {string} a formatted font string for use in a canvas.
 */
function font(font_size) {
  return `${font_size}px 'Tektur', sans-serif`
}



function createPreview(username, repoName, description, profileImgUrl) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = 1280, height = 640;
  canvas.width = width;
  canvas.height = height;

  const paddingX = 50;
  const xStart = paddingX, yStart = 100;
  const backgroundColor = '#282C34';
  const textColor = '#FFFFFF';
  const highlightUser = '#C778DD';
  const highlightRepo = '#98C379';
  const fontTitleSize = 60;
  const fontDescSize = 40;
  const fontUsernameSize = 35;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Adjust and Draw text (username / repo)
  let fontSize = fontTitleSize;
  while (true) {
    ctx.font = font(fontSize);
    const totalWidth = ctx.measureText(username).width + ctx.measureText(" / ").width + ctx.measureText(repoName).width;

    if (totalWidth <= width - 2 * paddingX) {
      break;
    }
    fontSize -= 1;
  }

  // Draw username / repo name centered
  const userRepoX = (width - ctx.measureText(username).width - ctx.measureText(" / ").width - ctx.measureText(repoName).width) / 2;
  ctx.fillStyle = highlightUser;
  ctx.fillText(username, userRepoX, yStart);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(" / ", userRepoX + ctx.measureText(username).width, yStart);

  ctx.fillStyle = highlightRepo;
  ctx.fillText(repoName, userRepoX + ctx.measureText(username).width + ctx.measureText(" / ").width, yStart);

  // Space available for description (avoid overlapping with signature and profile image)
  const maxDescHeight = height - (yStart + fontSize + 20) - 130; // Leaves space for signature and profile image

  let descFontSize = fontDescSize;
  let wrappedDescription = [];

  while (descFontSize > 10) { // Prevent font from becoming too small
    ctx.font = font(descFontSize);
    ctx.fillStyle = textColor;
    wrappedDescription = wrapText(ctx, description, descFontSize, width - 2 * paddingX);

    let totalHeight = wrappedDescription.length * (descFontSize + 10);
    if (totalHeight <= maxDescHeight) {
      break;
    }
    descFontSize -= 1;
  }

  let descY = yStart + fontSize + 25;

  wrappedDescription.forEach(line => {
    const textWidth = ctx.measureText(line).width;
    ctx.fillText(line, (width - textWidth) / 2, descY);
    descY += descFontSize + 10;
  });

  // Draw profile image (circular)
  const profileImg = new Image();
  profileImg.onload = () => {
    ctx.save();
    const radius = 25;
    ctx.beginPath();
    ctx.arc(50 + radius, height - 100 - radius, radius, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(profileImg, 50, height - 100 - 50, 50, 50);
    ctx.restore();

    // Draw username signature
    ctx.fillStyle = 'rgba(150, 150, 150, 1)';
    ctx.font = font(fontUsernameSize);
    ctx.fillText(username, width - ctx.measureText(username).width - paddingX, height - 130);

    // Show generated preview
    const dataUrl = canvas.toDataURL("image/png");
    document.getElementById("generated-image").src = dataUrl;
    document.getElementById("generated-image").style.display = 'block';

    // Show download button
    const downloadBtn = document.getElementById("download-btn");
    downloadBtn.style.display = 'block';

    // Handle download
    downloadBtn.onclick = () => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${username}_${repoName}_preview.png`;
      link.click();
    };

  };
  profileImg.src = profileImgUrl;
}


/**
 * Function that wraps text into multiple lines based on a given maximum width.
 *
 * @param ctx the canvas 2D rendering context used to measure text width.
 * @param text the input text to be wrapped.
 * @param font_size the font size (not used directly, but can be useful for further customization).
 * @param max_width the maximum width allowed per line before wrapping.
 * @returns {*[]} an array of strings where each element is a line of wrapped text.
 */
function wrapText(ctx, text, font_size, max_width) {
  const
    /**
     * Array to store the wrapped lines.
     * @type {*[]}
     */
    lines = [],
    /**
     * Splitting words, handling multiple spaces.
     * @type {*|string[]}
     */
    words = text.split(/\s+/);
  let
    /**
     * Current line.
     * @type {string}
     */
    current_line = '';


  words.forEach(word => {
    //Check if the word contains a newline character
    if (word.includes('\n')) {
      const
        /**
         * Split the word into separate parts.
         * @type {*|string[]}
         */
        parts = word.split('\n');


      for (let i = 0; i < parts.length; i++) {
        const
          /**
           * Temporary string that represents the current line with the next word appended.
           * @type {string}
           */
          temp_string = (current_line + ' ' + parts[i]).trim(),
          /**
           * Measures the pixel width of temp_string using the canvas context.
           * @type {number}
           */
          temp_string_width = ctx.measureText(temp_string).width;


        //If adding this part exceeds maxWidth, push the current line and start a new one
        if (temp_string_width > max_width && current_line) {
          lines.push(current_line);
          current_line = parts[i];
        }
        else {
          current_line = temp_string;
        }

        //If this part is followed by a forced line break, add the current line and reset
        if (i < parts.length - 1) {
          lines.push(current_line);
          current_line = '';
        }
      }
    }
    else {
      const
        /**
         * Temporary string that represents the current line with the next word appended.
         * @type {string}
         */
        temp_string = (current_line + ' ' + word).trim(),
        /**
         * Measures the pixel width of temp_string using the canvas context.
         * @type {number}
         */
        temp_string_width = ctx.measureText(temp_string).width;


      //If adding this word exceeds maxWidth, push the current line and start a new one
      if (temp_string_width > max_width && current_line) {
        lines.push(current_line);
        current_line = word;
      }
      else {
        current_line = temp_string;
      }
    }
  });

  //Push the last line if it contains text
  if (current_line) {
    lines.push(current_line.trim());
  }

  return lines;
}
