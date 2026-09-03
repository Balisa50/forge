## The one picture that prevents 90% of Git confusion

Git keeps your work in three places, and almost every beginner mistake comes from not knowing which one you are touching:

- **Working directory** is the files on your computer right now, exactly as you are editing them.
- **Staging area** is a holding tray for the precise changes you want in your next snapshot.
- **History** is the permanent timeline of snapshots you have already saved.

A **commit** moves changes from the staging area into history. A **push** copies that history up to GitHub so it lives somewhere other than your laptop. Every command below is just moving your work between these places. Hold this picture in your head and the commands stop feeling random.

## What Git is and why every team uses it

Git is the version-control tool behind essentially every codebase past day one. It snapshots your project after each meaningful change so you can see exactly what changed, undo a mistake without losing everything else, and work alongside other people without overwriting each other. You will use it every single day on this track, and the handful of commands below cover about 95% of daily work.

## Install Git and tell it who you are

```bash
# macOS:   brew install git
# Windows: winget install Git.Git   (or download from git-scm.com)
# Linux:   sudo apt install git

git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

`git --version` prints something like `git version 2.43.0`. If you instead see `command not found`, Git is not installed yet. Install it, then reopen your terminal so the new program is found.

The two `config` lines touch no project at all. They write your identity into a settings file in your home folder so every future commit is stamped with who made it. Skip them and your very first commit dies with `Author identity unknown`.

## The five commands you will actually use

```bash
git init               # turn the current folder into a Git repo
git status             # what has changed since the last commit?
git add file.py        # move one change into the staging area
git commit -m "msg"    # save everything staged as one snapshot
git log --oneline      # the list of snapshots, newest first
```

Walk them in the order you would really use them:

- `git init` creates a hidden `.git` folder, and that folder *is* the repo. You run it once per project. It prints `Initialized empty Git repository`.
- `git status` is the command you will run most. It shows which files changed and whether they are staged yet. Run it whenever you are unsure what state you are in, because it never changes anything itself.
- `git add file.py` moves that file's changes into staging. Nothing is saved yet, you are only choosing what goes into the next snapshot. Use `git add .` to stage everything at once.
- `git commit -m "msg"` writes everything staged into history as one snapshot. The `-m` flag is your one-line note to your future self about what changed. It prints something like `1 file changed, 3 insertions(+)`.
- `git log --oneline` prints one short line per commit so you can read the trail of your work. Press `q` to leave the log view.

## Push it to GitHub so it survives your laptop

```bash
# after creating an empty repo on github.com:
git remote add origin https://github.com/YOU/your-repo.git
git branch -M main
git push -u origin main
```

- `git remote add origin ...` saves GitHub's URL under the nickname `origin`. From here on, `origin` simply means "the GitHub copy."
- `git branch -M main` renames your current branch to `main` so it matches what GitHub expects.
- `git push -u origin main` uploads your commits to GitHub. The `-u` flag links your local `main` to GitHub's copy so that next time you can just type `git push`. Refresh the GitHub page and your files are there.

## When it breaks, and it will

- `Author identity unknown` means you skipped the two `git config` lines above. Run them, then commit again.
- `fatal: not a git repository` means you are not inside a repo folder. `cd` into the project, or run `git init` first.
- `failed to push some refs` means GitHub has a commit your laptop does not. Run `git pull` to merge it down, then push again.
- `nothing to commit, working tree clean` is not an error. Git is telling you there are no staged changes to save right now.

## Where Git shows up next

Every project on this track ships to GitHub, and every check-in you submit is backed by a commit. This is a prerequisite for everything that follows. Read it once now, and come back to it any time you are unsure which of the three places your work is currently sitting in.