"""Build github-activity.json for the "Latest on GitHub" section of the portfolio.

Lists the public, non-fork repositories of GITHUB_USER that carry the topic
PORTFOLIO_TOPIC, newest push first. Run by .github/workflows/update-github-activity.yml.
Standard library only, so the workflow needs no installs.
"""
import json
import os
import urllib.request

GITHUB_USER = os.environ.get("GITHUB_USER", "shamseldeen")
PORTFOLIO_TOPIC = os.environ.get("PORTFOLIO_TOPIC", "portfolio")
MAX_REPOS = int(os.environ.get("MAX_REPOS", "6"))
OUTPUT = os.environ.get("OUTPUT", "github-activity.json")


def fetch_repos():
    url = f"https://api.github.com/users/{GITHUB_USER}/repos?per_page=100&type=owner"
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "shamsinsights-portfolio"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as resp:
        return json.load(resp)


def main():
    repos = [
        r for r in fetch_repos()
        if not r.get("fork") and not r.get("private") and not r.get("archived")
        and PORTFOLIO_TOPIC in (r.get("topics") or [])
    ]
    repos.sort(key=lambda r: r.get("pushed_at") or "", reverse=True)
    items = [
        {
            "name": r["name"],
            "description": r.get("description") or "",
            "url": r["html_url"],
            "homepage": r.get("homepage") or "",
            "language": r.get("language") or "",
            "topics": [t for t in (r.get("topics") or []) if t != PORTFOLIO_TOPIC],
            "pushed_at": r.get("pushed_at") or "",
        }
        for r in repos[:MAX_REPOS]
    ]
    # No timestamp at the top level: the file only changes when a repo changes,
    # so the workflow commits only when there is something new.
    data = {"user": GITHUB_USER, "topic": PORTFOLIO_TOPIC, "repos": items}
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote {len(items)} repositories to {OUTPUT}")


if __name__ == "__main__":
    main()
