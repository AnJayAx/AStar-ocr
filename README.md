# Notable notes

## Getting the template
Template is on `bitbucket.com` private repository.
- Developers are to sign up for an account
- Pls provide developers' email for us to grant access
- Reason: Version control and ease of code distribution/updates

Then, clone the repo and install dependencies.
- `git clone https://<your-username>@bitbucket.org/ngzj/dis-template-distribution.git`
- `cd dis-template-distribution`
- `npm install`
- `ng serve` and preview at `localhost:4200`

## Updating the template
- Commit your code in your local repository
- Get updates from remote repository by `git pull origin master`
  - If you have edited the remote, change `origin` to `<your-remote-name>`
- Then merge changes (see addendum below on updating)

## Addendum on updating
**Note: Path reference added in project `"@dis/*": ["src/app/DIS/*"]`**
This means that, the shorthand, `@dis/<filename>` references `src/app/DIS/<filename>`.

**Q1:** As this template is still being developed, how will future changes affect me? Will I have to rework my app?

**A1:** All* changes will be contained within the folder `@dis` (to the best of our ability). It is recommended that developers do not modify contents in this folder, _with the exception_ of `*.config` files within `@dis/settings`. These files are where developers provide information specific to their app to the template, i.e. what are the navigation links and which user role can see and access them. Outside of these files, treat this folder as a readonly _external library_, i.e. import if functionalities are needed, but do not edit. This will make `git pull` and merging simple, no large scale rework required.

**Q2:** Why is there an asterisk beside All*? Will there be many changes outside of `@dis`?

**A2:** There are only 3 locations in which further development of the template will potentially require changes outside of `@dis`. These 3 locations are:
- `src/assets/img`: When new image files are added to the template
  - (OCCURS RARELY) This would be a rare occurence. Currently, the only image files used in the template are the SIMTech logos. Hence, while possible, we do not wish to add additional config to `angular.json` and have another `/asset/img` within `@dis`.
- `src/app/app.module.ts`: When new dependencies are required by the template
  - (WILL HAPPEN - DO APPEND) As each project has a consolidated `app.module.ts`, new dependencies have to be appended. Unavoidable.
- `package.json`: When new dependencies are required by the template
  - (WILL HAPPEN - DO APPEND) As each project has a consolidated `package.json`, new dependencies have to be appended. Unavoidable.

**Q3:** So does this mean that I have to update `@dis` every time a newer version of the template is released?

**A3:** Yes. Do a `git pull` and merge. Only potential conflicts are in `@dis/settings` `*.config` files, `src/assets/img`, `src/app/app.module.ts` and `package.json` (Explained in A2). These conflicts can mostly be resolved by simply appending or opting to preserve your projects' version (i.e. in `sidebar.config.ts`, there's no need to append as the links provided in the template are samples).

**Q4:** (For some developers) I don't Git it and I don't have time to learn because...

**A4:** Go to the repo. Download. Note the changes you made in `@dis/settings` `*.config`. Delete `@dis` from your project. Copy the downloaded `@dis` into your project. Append the changes you made back to `@dis/settings` `*.config`. Check the repo's `src/assets/img`,  `src/app/app.module.ts` and `package.json`. Diff. Append the diff to your local project. Run `npm install` then `ng serve`.

**Q5:** I imported a component from Kendo library and followed their example code exactly, but it appears weird.

**A5:** Please send us a screenshot of the component, the component name and your code snippet for the component only (not your entire project code). We will try to fix it.

## Working with the template
- **Make sure your working dir is not `@dis` when you create components/services etc with angular-cli (see A1 for reason)**
- Create a page
- Use default components from Kendo
- Implement app specific logic, i.e. fetch data, CRUD
- Import template 'variables' into your components' scss when styling
  ```scss
  // Example scss file where template variables are used
  @import "variables"; // Global path is set up for your convenience
  p {
    color: $success; // To see what variables are available, go to src/app/DIS/styles/_variables.scss
  }
  ```
    - What are the variables? Variables available are in these categories: [1] Color (base, semantics, graph series), [2] Typography, [3] Layout (gap, shadow, border, transition), [4] Breakpoints. See `@dis/styles/_variables.scss`.
- After creating all pages, go to `@dis/settings` and add those pages into `routes.config.ts` and `sidebar.config.ts`. Based on user roles, some routes or sidebar items can be shown/hidden/locked. This is to be integrated with SSO and is currently being developed. (IN CURRENT RELEASE, ROLE BASED CONTROL HAS NOT BEEN IMPLEMENTED.)

## How-to basics
- How to create a page
  - `cd` to desired location (note: must be outside of `@dis` folder to ensure minimal conflicts when we update `@dis` folder in the future)
  - `ng g c <your-page-name>` (it is recommended that a folder structure is used to organize your project, i.e. `/views`)
- How to link page to routes and sidebar menu
  - In `/src/app/DIS/settings` (recall: only *.config.ts files in this folder should be edited), open up `routes.config.ts` and `sidebar.config.ts`
  - Import `<your-page-name>` and extend the existing configuration object
- How to ???
  - We understand that Angular is a new framework for some. The official Angular docs (`angular.io`) are very useful to learn the basics.

<br>

# Generated by cli

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
