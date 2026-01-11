let members = [];
let idCounter = 1;


function saveMember() {
  const id = document.getElementById("memberId").value;
  const name = document.getElementById("name").value.trim();
  const gender = document.getElementById("gender").value;
  const dob = document.getElementById("dob").value;
  const fatherId = document.getElementById("father").value || null;
  const motherId = document.getElementById("mother").value || null;
  const spouseId = document.getElementById("spouse").value || null;

  if (!name) {
    alert("Name is required");
    return;
  }

  if (id) {
    const member = members.find(m => m.id == id);
    member.name = name;
    member.gender = gender;
    member.dob = dob;
    member.fatherId = fatherId;
    member.motherId = motherId;
    updateSpouse(member, spouseId);
  } else {
    const newMember = {
      id: idCounter++,
      name,
      gender,
      dob,
      fatherId,
      motherId,
      spouseId: null,
      children: []
    };

    members.push(newMember);

    if (fatherId) addChild(fatherId, newMember.id);
    if (motherId) addChild(motherId, newMember.id);

    updateSpouse(newMember, spouseId);
  }

  resetForm();
  updateDropdowns();
  renderTree();
}


function updateSpouse(member, newSpouseId) {

  if (member.spouseId) {
    const oldSpouse = members.find(m => m.id == member.spouseId);
    if (oldSpouse) oldSpouse.spouseId = null;
  }

  member.spouseId = null;

  if (newSpouseId) {
    const spouse = members.find(m => m.id == newSpouseId);
    if (spouse) {
      spouse.spouseId = member.id;
      member.spouseId = spouse.id;
    }
  }
}


function addChild(parentId, childId) {
  const parent = members.find(m => m.id == parentId);
  if (parent && !parent.children.includes(childId)) {
    parent.children.push(childId);
  }
}


function updateDropdowns() {
  const father = document.getElementById("father");
  const mother = document.getElementById("mother");
  const spouse = document.getElementById("spouse");

  father.innerHTML = `<option value="">None</option>`;
  mother.innerHTML = `<option value="">None</option>`;
  spouse.innerHTML = `<option value="">None</option>`;

  members.forEach(m => {
    father.innerHTML += `<option value="${m.id}">${m.name}</option>`;
    mother.innerHTML += `<option value="${m.id}">${m.name}</option>`;

    if (!m.spouseId) {
      spouse.innerHTML += `<option value="${m.id}">${m.name}</option>`;
    }
  });
}


function renderTree() {
  const treeDiv = document.getElementById("tree");
  treeDiv.innerHTML = "";

  const roots = members.filter(m => {
  if (m.fatherId || m.motherId) return false;

  // If married, only allow one partner to be root
  if (m.spouseId) {
    return m.id < m.spouseId;
  }

  return true;
});


  roots.forEach(root => {
    treeDiv.appendChild(createNode(root));
  });
}

function createNode(member) {
  const div = document.createElement("div");
  div.className = "tree-node";

  const spouse = members.find(m => m.id == member.spouseId);
  div.textContent = spouse ? `${member.name} + ${spouse.name}` : member.name;

  div.onclick = () => showDetails(member.id);

  const container = document.createElement("div");
  container.appendChild(div);

  member.children.forEach(cid => {
    const child = members.find(m => m.id === cid);
    if (child) {
      const childDiv = createNode(child);
      childDiv.classList.add("child");
      container.appendChild(childDiv);
    }
  });

  return container;
}


function showDetails(id) {
  const m = members.find(x => x.id === id);
  const spouse = members.find(x => x.id == m.spouseId);

  const father = members.find(x => x.id == m.fatherId);
  const mother = members.find(x => x.id == m.motherId);

  const childrenIds = spouse
    ? [...new Set([...m.children, ...spouse.children])]
    : m.children;

  const childrenNames =
    childrenIds
      .map(cid => members.find(x => x.id == cid)?.name)
      .join(", ") || "None";

  let html = `
    <strong>${m.name}</strong><br>
    Gender: ${m.gender || "N/A"}<br>
    DOB: ${m.dob || "N/A"}<br>
    Father: ${father?.name || "N/A"}<br>
    Mother: ${mother?.name || "N/A"}<br><br>

    <button onclick="editMember(${m.id})">Edit ${m.name}</button>
  `;

  if (spouse) {
    html += `
      <hr>
      <strong>${spouse.name}</strong><br>
      Gender: ${spouse.gender || "N/A"}<br>
      DOB: ${spouse.dob || "N/A"}<br><br>

      <button onclick="editMember(${spouse.id})">Edit ${spouse.name}</button>
    `;
  }

  html += `
    <hr>
    <strong>Children:</strong> ${childrenNames}<br><br>
    <button class="delete" onclick="deleteMember(${m.id})">
      Delete ${m.name}
    </button>
  `;

  document.getElementById("details").innerHTML = html;
}



function editMember(id) {
  const m = members.find(x => x.id === id);

  document.getElementById("memberId").value = m.id;
  document.getElementById("name").value = m.name;
  document.getElementById("gender").value = m.gender;
  document.getElementById("dob").value = m.dob;
  document.getElementById("father").value = m.fatherId || "";
  document.getElementById("mother").value = m.motherId || "";
  document.getElementById("spouse").value = m.spouseId || "";
}


function deleteMember(id) {
  if (!confirm("Are you sure you want to delete this member?")) return;

  const member = members.find(m => m.id === id);

  if (member.spouseId) {
    const spouse = members.find(m => m.id == member.spouseId);
    if (spouse) spouse.spouseId = null;
  }

  members = members.filter(m => m.id !== id);

  members.forEach(m => {
    m.children = m.children.filter(cid => cid !== id);
    if (m.fatherId == id) m.fatherId = null;
    if (m.motherId == id) m.motherId = null;
  });

  document.getElementById("details").textContent =
    "Select a member from the tree";

  renderTree();
  updateDropdowns();
}


function resetForm() {
  document.getElementById("memberId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("dob").value = "";
  document.getElementById("father").value = "";
  document.getElementById("mother").value = "";
  document.getElementById("spouse").value = "";
}
