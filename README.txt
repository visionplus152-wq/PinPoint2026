# Pinpoint Travel — Tours & Experiences page

## Install
1. Download and extract this folder.
2. Upload the `TourPackages` folder into the root of your existing GitHub Pages repository.
3. Keep the folder name `TourPackages` so the page URL becomes:
   https://pinpointtravel.store/TourPackages/
4. Open `TourPackages/data/experiences.js` and replace the sample records with verified Travelpayouts deep links.
5. Test the page on desktop and mobile after publishing.

## Important customisation
- `data/destinations.js`: add/edit continents, countries, cities, images and each city's experience IDs.
- `data/experiences.js`: add the real activity name, provider, image, description and affiliate deep link.
- Only set `status: "active"` when the affiliate link has been checked and works. Keep `affiliateUrl: "#"` / `status: "sample"` until then.
- The sample activity cards are placeholders, not live booking inventory.
- Update navigation links in `index.html` if your existing site uses different paths.
- The page uses remote Unsplash image URLs as temporary visual assets. For production, replace them with your own optimised, licensed WebP images in the assets folder.

## Notes
This is a standalone static HTML/CSS/JavaScript page and does not require React, a database, Node.js or a build step.
