[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$skills = @(
    @{ Source = "vercel/ai"; Name = "ai-sdk" },
    @{ Source = "anthropics/skills"; Name = "frontend-design" },
    @{ Source = "shadcn/ui"; Name = "shadcn" },
    @{ Source = "vercel-labs/agent-skills"; Name = "vercel-composition-patterns" },
    @{ Source = "vercel-labs/agent-skills"; Name = "vercel-react-best-practices" },
    @{ Source = "vercel-labs/agent-skills"; Name = "web-design-guidelines" }
)

foreach ($skill in $skills) {
    Write-Host "Installing $($skill.Name) from $($skill.Source)…"
    & npx --yes skills add $skill.Source --skill $skill.Name -y
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install $($skill.Name)."
    }
}

Write-Host "External agent skills installed. Review skills-lock.json and upstream licences before committing lock changes."
