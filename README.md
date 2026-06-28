# Shaan Fisher's Computing 2 Coursework Submission - final version
**CID**: [02564153]

# Development Process
My development process followed test driven development. I wrote the unit tests first ensuring that all tests failed using skeleton functions of my API. Then I constructed the minimum code to get them to work, I then refined these functions - this structure was very effective at driving progress. 

I researched property based testing using James Sinclair's Guide, and implemented property based testing using fast check, generating abritraries for a random setup state, and then a random active state where I essentially use fast check to randomly play the game. I then use these states to test invariant behaviour. In some cases, certain examples had to be constructed, but fc was still used for generative testing to test more examples.

In the game, you play against a computer which I designed and coded. For the active phase (moving rings), the algorithm was designed to search for all the valid moves and score each move. Score was calculated using a weighted sum, where own marker colour gain increased score slightly, and constructing a line of 5 greatly increased score, similarly enemy marker colour gain decreased score slightly, giving an enemy a line of 5 decreased score greatly, finally getting a win (3 lines of five) had the highest weighting so the algorithm always chose the winning move. 

This weighted scoring system successfuly createed a moderately difficult computer to play against. However I wanted to take it further so it was smarter, I did this by enabling the computer to think more moves ahead by using recursion. I added a depth parameter, "make_best_move(state, depth)", where depth represents how many turns ahead the future calculates, e.g. a depth of 1 means the computer considers its turn and how that turn impacts opportunities for the enemy. A depth of 1 greatly increased difficulty of the computer, unfortunately, running a depth >1 was infeasible due to an exponential increase in required computing power and the fact it runs on the browser rather than the local machine.

For the setup phase (ring placement), a simpler algorithm was used which looked to place rings in spots where there are 6 free spaces surrounding it since part of Yinsh's strategy is a broad ring placement. For the harder difficulty algorithm, I ensured that the computer placed rings near enemy rings to try to block potentialy ring lines of fives. In terms of next steps for this algorithm, It would be interesting to try reinforcement learning.

Accessibility was met using the axe dev tools but also by adding keyboard access - so you can navigate the hex grid using arrow keys and place/select rings using enter.

Note that the real Yinsh game allows you to remove rings when you get a 5 in a row but I ran out of time to do this - although it barely affects the gameplay and does not add to the complexity of the game logic 

Note that AI was used to help resolve trivial linter errors quickly such as indents, spacing etc. It was also used for debugging if I struggled to resolve or find the root of an error.





















































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
