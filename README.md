# Mr. Klin

The Mr. Klin dashboard, its booking API, and the source of the public website.

| Live site | Deployed from |
|---|---|
| Dashboard: https://mr-klin.vercel.app | this repo (`mr.klin`) |
| Public website: https://websitemrklin.vercel.app | the `Website-MR.KLIN` repo, which holds a copy of this repo's `website/` folder |

## Folders

```
index.html             Dashboard page (markup only)
css/dashboard.css      Dashboard styles
js/
  tailwind.config.js   Tailwind colour and font settings (loads right after the Tailwind CDN)
  theme-init.js        Applies the saved dark/light theme before the page draws
  dashboard.js         All dashboard behaviour: login, sections, bookings, settings
api/
  bookings.js          Booking API used by the website and the dashboard (Upstash Redis)
  status.js            Site status checks shown in Developer Tools
images/                Logo and icons used by the dashboard
  unused/              Photos not used by any page, kept for reference

website/               The public website
  index.html, about.html, services.html, work.html, contact.html, booking.html
  css/site.css         One stylesheet shared by every page
  js/
    theme-init.js      Applies the saved theme before the page draws
    site.js            Theme toggle, mobile menu, scroll animations (every page)
    booking.js         "Book a service" popup (every page)
    booking-details.js Booking details page (booking.html)
    contact.js         Message form (contact.html)
    gallery.js         Our Work gallery and photo viewer (work.html)
  images/              Photos and logo used by the website
```

## Making changes

- **Website:** edit the files in `website/`, push this repo, then copy the contents of `website/` into the `Website-MR.KLIN` repo and push that too. That second push is what updates the live public site.
- **Dashboard:** edit `index.html`, `css/dashboard.css` or `js/dashboard.js` and push this repo.
- Each page loads its CSS and JavaScript with plain `<link>` and `<script src>` tags. There is no build step.
