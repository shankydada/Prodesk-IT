// CoverLetterForm component
// Right now it only displays the UI.
// Later we will connect it with React state.
function CoverLetterForm() {
  return (
    <form>

      <div>
        <label>Candidate Name</label>

        <input
          type="text"
          placeholder="Enter your name"
        />
      </div>

      <br />

      <div>
        <label>Target Company</label>

        <input
          type="text"
          placeholder="Google"
        />
      </div>

      <br />

      <div>
        <label>Job Role</label>

        <input
          type="text"
          placeholder="Software Engineer"
        />
      </div>

      <br />

      <div>
        <label>Key Skills</label>

        <textarea
          placeholder="React, Node.js, JavaScript"
        ></textarea>
      </div>

      <br />

      <button>

        Generate Cover Letter

      </button>

    </form>
  );
}

export default Form;