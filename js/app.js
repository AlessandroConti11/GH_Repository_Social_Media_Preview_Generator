const
    /**
     * The input where to insert the repository URL.
     * @type {HTMLElement}
     */
    repository_url_input = document.getElementById("repo-input"),
    /**
     * The download button.
     * @type {HTMLElement}
     */
    download_button = document.getElementById("download-btn"),
    /**
     * The select where to select the background color.
     * @type {HTMLElement}
     */
    background_color_select = document.getElementById("background-color"),
    /**
     * The select where to select the username color.
     * @type {HTMLElement}
     */
    username_color_select = document.getElementById("username-color"),
    /**
     * The select where to select the repository color.
     * @type {HTMLElement}
     */
    repository_color_select = document.getElementById("repository-color"),
    /**
     * The select where to select the description color.
     * @type {HTMLElement}
     */
    description_color_select = document.getElementById("description-color"),
    /**
     * The select where to select the signature color.
     * @type {HTMLElement}
     */
    signature_color_select = document.getElementById("signature-color"),
    /**
     * The color option container.
     * @type {HTMLElement}
     */
    color_options_container = document.getElementById("color-options");


/**
 * Add Enter event to the input.
 */
repository_url_input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    generate_preview();
  }
});


window.addEventListener("load", function() {
  default_color_options();
})


/**
 * Function that sets the default color options.
 */
function default_color_options() {
  background_color_select.value = '#282C34';
  username_color_select.value = '#C778DD';
  repository_color_select.value = '#98C379';
  description_color_select.value = '#FFFFFF';
  signature_color_select.value = '#969696';
}


/**
 * Function that generates a preview of a GitHub repository based on a URL input.
 *
 * @returns {Promise<void>} does not return anything but creates a preview for the repository.
 */
async function generate_preview() {
  //Wait until the 'Tektur' font is loaded
  await document.fonts.load("10px 'Tektur'")


  const
    /**
     * Validate the input URL and extract the owner and repo names.
     * @type {RegExpMatchArray}
     */
    match = repository_url_input.value.trim().match(/github\.com\/(.+)\/(.+)/);

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
  create_preview(username, repository_name, description, avatar_image_objectURL);


  //Hide the color options container
  if (color_options_container.classList.contains("expanded")){
    toggle_color_options();
  }


  //Set the default color options
  default_color_options();
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


/**
 * Function that generates a preview image for a GitHub repository.
 * The preview includes the username, repository name, description, and profile image.
 *
 * @param username the GitHub username.
 * @param repository_name the GitHub repository name.
 * @param description the GitHub description.
 * @param profile_image_url the URL of GitHub profile image.
 */
function create_preview(username, repository_name, description, profile_image_url) {
  const
      /**
       * The canvas element.
       * @type {HTMLCanvasElement}
       */
      canvas = document.createElement('canvas'),
      /**
       * The drawing context of the canvas element.
       * @type {CanvasRenderingContext2D}
       */
      canvas_context = canvas.getContext('2d'),
      /**
       * The width of the image.
       * @type {number}
       */
      width = 1280,
      /**
       * The height of the image.
       * @type {number}
       */
      height = 640,
      /**
       * The horizontal padding.
       * @type {number}
       */
      padding_x = 50,
      /**
       * The vertical padding.
       * @type {number}
       */
      padding_y = 150,
      /**
       * The background color.
       * @type {string}
       */
      // background_color = '#282C34',
      background_color = background_color_select.value,
      /**
       * The description color.
       * @type {string}
       */
      // description_color = '#FFFFFF',
      description_color = description_color_select.value,
      /**
       * The username color.
       * @type {string}
       */
      // username_color = '#C778DD',
      username_color = username_color_select.value,
      /**
       * The repository color.
       * @type {string}
       */
      // repository_color = '#98C379',
      repository_color = repository_color_select.value,
      /**
       * The signature color.
       * @type {string}
       */
      // signature_color = '#969696',
      signature_color = signature_color_select.value,
      /**
       * The title (Username / Repository) font size.
       * @type {number}
       */
      title_font_size = 60,
      /**
       * The description font size.
       * @type {number}
       */
      description_font_size = 40,
      /**
       * The signature font size.
       * @type {number}
       */
      signature_font_size = 35;


  //Set width and height of the image
  canvas.width = width;
  canvas.height = height;

  //Draw background
  canvas_context.fillStyle = background_color;
  canvas_context.fillRect(0, 0, width, height);


  //Draw Username / Repository
  let
      /**
       * Temporary font size.
       * @type {number}
       */
      temporary_font_size = title_font_size;

  while (true) {
    canvas_context.font = font(temporary_font_size);
    const
        /**
         * Total width of title.
         * @type {number}
         */
        title_total_width = canvas_context.measureText(username).width + canvas_context.measureText(" / ").width + canvas_context.measureText(repository_name).width;

    if (title_total_width <= width - 2 * padding_x) {
      break;
    }
    temporary_font_size -= 1;
  }

  const
      /**
       * The x-axis coordinate of the point at which to begin drawing the title, in pixels.
       * @type {number}
       */
      title_x = (width - canvas_context.measureText(username).width - canvas_context.measureText(" / ").width - canvas_context.measureText(repository_name).width) / 2;

  //Username
  canvas_context.fillStyle = username_color;
  canvas_context.fillText(username, title_x, padding_y);

  //.../
  canvas_context.fillStyle = description_color;
  canvas_context.fillText(" / ", title_x + canvas_context.measureText(username).width, padding_y);

  //...Repository
  canvas_context.fillStyle = repository_color;
  canvas_context.fillText(repository_name, title_x + canvas_context.measureText(username).width + canvas_context.measureText(" / ").width, padding_y);


  //Draw description
  const
      /**
       * Maximum description height.
       * @type {number}
       */
      maximum_description_height = height - (padding_y + temporary_font_size + 20) - 130; // Leaves space for signature and profile image

  let
      /**
       * List of multiple lines based on a given maximum width.
       * @type {*[]}
       */
      description_lines = [];

  temporary_font_size = description_font_size;
  while (temporary_font_size > 10) {
    canvas_context.font = font(temporary_font_size);
    canvas_context.fillStyle = description_color;
    description_lines = wrap_text(canvas_context, description, temporary_font_size, width - 2 * padding_x);

    let
        /**
         * Total description height.
         * @type {number}
         */
        total_description_height = description_lines.length * (temporary_font_size + 10);

    if (total_description_height <= maximum_description_height) {
      break;
    }
    temporary_font_size -= 1;
  }

  let
      /**
       * The y-axis coordinate of the baseline on which to begin drawing the description, in pixels.
       * @type {number}
       */
      description_y = padding_y + temporary_font_size + 25;

  description_lines.forEach(line => {
    canvas_context.fillText(line, (width - canvas_context.measureText(line).width) / 2, description_y);
    description_y += temporary_font_size + 10;
  });


  //Draw profile image
  const
      /**
       * The profile image.
       * @type {HTMLImageElement}
       */
      profile_image = new Image();

  profile_image.onload = () => {
    canvas_context.save();
    const
        /**
         * The radius of profile image
         * @type {number}
         */
        radius = 25;

    canvas_context.beginPath();
    canvas_context.arc(50 + radius, height - 100 - radius, radius, 0, 2 * Math.PI);
    canvas_context.clip();
    canvas_context.drawImage(profile_image, 50, height - 100 - 50, 50, 50);
    canvas_context.restore();


    //Draw signature
    canvas_context.fillStyle = signature_color;
    canvas_context.font = font(signature_font_size);
    canvas_context.fillText(username, width - canvas_context.measureText(username).width - padding_x, height - 130);


    //Show generated preview
    const
        /**
         * The generated preview.
         * @type {string}
         */
        generated_preview_url = canvas.toDataURL("image/png");

    document.getElementById("generated-image").src = generated_preview_url;
    document.getElementById("generated-image").style.display = 'block';


    //Show download button
    download_button.style.display = 'block';


    //Handle download
    download_button.onclick = () => {
      const
          /**
           * The image preview download link.
           * @type {HTMLAnchorElement}
           */
          link = document.createElement('a');
      link.href = generated_preview_url;
      link.download = `${username}_${repository_name}_preview.png`;
      link.click();
    };

  };

  profile_image.src = profile_image_url;
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
function wrap_text(ctx, text, font_size, max_width) {
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


/**
 * Function that shows or hides the color options.
 */
function toggle_color_options() {
  color_options_container.classList.toggle("expanded");
}
