let skills = [];
let completed = [];

// Load all skills and render checklist with links
async function loadSkills() {
  const response = await fetch('http://localhost:5000/skills');
  skills = await response.json();
  document.getElementById('skills').innerHTML =
    skills.map(skill =>
      `<div class="skill-item">
        <input type="checkbox" value="${skill._key}" onchange="toggleSkill(this)">
        <span class="skill-name" onclick="showPrereqs('${skill._key}')">${skill.name}</span>
        ${skill.link ? `<a href="${skill.link}" target="_blank" class="skill-link">Learn</a>` : ''}
      </div>`
    ).join('');
}

// Tracks checked skills (for button logic)
function toggleSkill(box) {
  if (box.checked) completed.push(box.value);
  else completed = completed.filter(k => k !== box.value);
  document.getElementById('prereq-view').innerHTML = '';
}

// Button: Show prerequisites for checked skill
async function showCheckedPrereqs() {
  // Find all checked checkboxes
  const checkedBoxes = Array.from(document.querySelectorAll('#skills input[type="checkbox"]:checked'));
  if (checkedBoxes.length !== 1) {
    document.getElementById('prereq-view').innerHTML =
      `<span style="color:red;">Please select exactly ONE skill to show prerequisites.</span>`;
    return;
  }
  const key = checkedBoxes[0].value;
  const skill = skills.find(s => s._key === key);
  if (!skill) return;
  // Get prerequisites from backend
  const response = await fetch('http://localhost:5000/skills/prereqs/' + key);
  const prereqs = await response.json();
  document.getElementById('prereq-view').innerHTML =
    `<b>Prerequisites for ${skill.name}:</b> <br>` +
    (prereqs.length ? prereqs.map(s => s.name).join(', ') : 'None (starter skill)');
}

// Optional: Clicking a skill name immediately shows its prerequisites too
async function showPrereqs(key) {
  const skill = skills.find(s => s._key === key);
  if (!skill) return;
  const response = await fetch('http://localhost:5000/skills/prereqs/' + key);
  const prereqs = await response.json();
  document.getElementById('prereq-view').innerHTML =
    `<b>Prerequisites for ${skill.name}:</b> <br>` +
    (prereqs.length ? prereqs.map(s => s.name).join(', ') : 'None (starter skill)');
}

window.onload = loadSkills;
