require('dotenv').config();
const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require('@octokit/rest');
const { sampleSize } = require('lodash');

const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });

const context = github.context;
const owner = context.repo.owner;
const repo = context.repo.repo;

const REDARR = [...new Array(33).keys()].map((e,i,a) => a[i] = e +1);
const BLUEARR = [...new Array(16).keys()].map((e,i,a) => a[i] = e +1);

const TITLE = `
Just for fun
| Red | Blue |
| -- | -- |`;

async function main () {
  try {
    const issueNumber = context.payload.issue.number;
    const issueBody = context.payload.issue.body;

    const commentBody = context.payload.comment.body;
    const commentAuth = context.payload.comment['author_association'];
    let body = '';
    if (context.eventName == 'issue') {
      body = getBody(issueBody);
    } else if (context.eventName == 'issue_comment' && commentAuth != 'NONE') {
      body = getBody(commentBody);
    }

    if (body) {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body
      });
    }

    function getBody (body) {
      let result = body;
      if (body.startsWith('/TCB')) {
        let number = body.split(' ')[1];
        if (number) {
          let r = '';
          for (let i = 0; i < number; i++) {
            let {red, blue} = getRedBlue();
            r += `| ${red[0]} ${red[1]} ${red[2]} ${red[3]} ${red[4]} ${red[5]} | ${blue[0]} |\n`
          }
          result = `${TITLE}\n${r}`;
        } else {
          let {red, blue} = getRedBlue();
          result = `${TITLE}\n| ${red[0]} ${red[1]} ${red[2]} ${red[3]} ${red[4]} ${red[5]} | ${blue[0]} |`;
        };
        return result;
      }
      return `${result} too`;
    };

    function getRedBlue () {
      let red = sampleSize(REDARR, 6);
      red.sort((a,b) => a - b);
      let blue = sampleSize(BLUEARR, 1);
      return { red, blue };
    };

  } catch (err) {
    core.setFailed(err.message);
  }
};

main();
