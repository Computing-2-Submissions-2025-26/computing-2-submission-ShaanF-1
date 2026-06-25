[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/H6lPFq0J)
# Computing 2 Coursework Submission.
**CID**: [02564153]

My development process involved test driven development, I wrote the unit tests first ensuring that all tests failed when passing undefined and then constructed the minimal code to get them to work, I then refined these functions - this structure was very effective at driving progress. I researched into property based testing, and used fast check, however the unit tests produced are more like highly comprehensive example based tests rather than property based testing due to time constraints, however this generative testing is still more effective and thorough than simple example based tests. 

In the game, you play against a computer which I designed and coded, since Yinsh is a very logical game aimed at optimising markers of your colour by flipping them and getting 5 in a rows. The algorithm was designed to search for all the valid moves, try them and score the outcome of the turn, scoring increased the more markers of the computers colour were gained but more importantly a high weighting was placed on if the turn achieved a 5 in a row, scoring was decreased if enemy markers were increased due to flipping them and greatly decreased if it resulted in the enemy getting a 5 in a row. This algorithm worked, however I wanted to try to use recursion to increase the difficulty of the algorithm, I added a depth parameter to make_best_move(), where depth represents how many turns in the future the computer considers, e.g. a depth of 1 means that the computer considers its turn and also how that turn impacts the opportunities for the enemy on their turn. This greatly increased the difficulty of the algorithm. Unfortunately running a depth >1 was infeasible due to exponentially more required computing power. Ring placement was a simpler algorithm which just looked to place rings in spots where there are 6 free spaces around it as part of the strategy of Yinsh is widespread ring placement- It would be interesting to take it further and try a reinforcement learning approach. 

Note that AI was used to help resolve linter errors quickly


This is the submission template for your Computing 2 Applications coursework submission.

## Checklist
### Install dependencies locally
This template relies on a a few packages from the Node Package Manager, npm.
To install them run the following commands in the terminal.
```properties
npm install
```
These won't be uploaded to your repository because of the `.gitignore`.
I'll run the same commands when I download your repos.

### Game Module – API
*You will produce an API specification, i.e. a list of function names and their signatures, for a Javascript module that represents the state of your game and the operations you can perform on it that advances the game or provides information.*

- [ ] Include a `.js ` module file in `/web-app` containing the API using `jsdoc`.
- [ ] Update `/jsdoc.json` to point to this module in `.source.include` (line 7)
- [ ] Compile jsdoc using the run configuration `Generate Docs`
- [ ] Check the generated docs have compiled correctly.

### Game Module – Implementation
*You will implement, in Javascript, the module you specified above. Such that your game can be simulated in code, e.g. in the debug console.*

- [ ] The file above should be fully implemented.

### Unit Tests – Specification
*For the Game module API you have produced, write a set of unit tests descriptions that specify the expected behaviour of one aspect of your API, e.g. you might pick the win condition, or how the state changes when a move is made.*

- [ ] Write unit test definitions in `/web-app/tests`.
- [ ] Check the headings appear in the Testing sidebar.

### Unit Tests – Implementation
*Implement in code the unit tests specified above.*

- [ ] Implement the tests above.

### Web Application
*Produce a web application that allows a user to interface with your game module.*

- Implement in `/web-app`
  - [ ] `index.html`
  - [ ] `default.css`
  - [ ] `main.js`
  - [ ] Any other files you need to include.

### Finally
- [ ] Push to GitHub.
- [ ] Sync the changes.
- [ ] Check submission on GitHub website.
