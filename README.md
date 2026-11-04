# Evaluating Multimodal Accessibility and Cognitive Load using AI

BSc (Hons) Creative Computing dissertation project by **Mireya Francesca Vella**.

An AI-powered **Visual Studio Code extension** for analysing HTML, CSS, JavaScript,
and TypeScript/React source code for WCAG 2.2 accessibility barriers. The system
also provides remediation guidance and a NASA-TLX-informed estimate of the
workload that those barriers may impose on users.

[Read the submitted dissertation (PDF)](docs/dissertation/dissertation.pdf)

## Project

The project investigates whether AI-assisted, source-level analysis can
complement conventional rendered-page accessibility tools within a shift-left
development workflow.

The system combines:

- A VS Code webview extension for analysing the active source file.
- Large language models for accessibility issue detection and explanation.
- Retrieval-augmented generation (RAG) using WCAG 2.2 and NASA-TLX guidance.
- A hybrid semantic and BM25 retrieval service backed by ChromaDB.
- Actionable remediation guidance for developers.
- A NASA-TLX-informed workload estimate derived from detected barriers.

The extension exposes two commands:

| Command | Purpose |
| --- | --- |
| `Accessibility: Analyse Current File` | Analyse the active HTML, CSS, JavaScript, or TSX file. |
| `Accessibility: NASA TLX Analysis` | Estimate workload using the detected accessibility barriers. |

## Evaluation

The dissertation reports a six-study evaluation programme:

1. [Screening candidate language models](research-results/Study%201%20-%20model-screening/).
2. [Comparing model and prompt configurations](research-results/Study%202%20-%20parameter-selection/).
3. [Performing more detailed detection testing](research-results/Study%203%20-%20detailed-evaluation/).
4. [Benchmarking the NASA-TLX workload-estimation pipeline](research-results/Study%204%20-%20nasa-tlx/).
5. [Validating the assistant with developers and assistive-technology users](research-results/Study%205%20-%20real-world-validation/).
6. [Comparing the assistant with established accessibility tools](research-results/Study%206%20-%20tool-comparison/).

The evaluated source types are **HTML, CSS, JavaScript, and TypeScript/React
(TSX)**. The final evaluation compares the assistant with Lighthouse, axe-core,
Axe Accessibility Linter, ESLint `jsx-a11y`, Webhint, and stylelint accessibility
rules.

## Findings

The submitted dissertation reports the following results within the evaluated
scope:

- The best controlled configuration achieved **F1 = 70.5%** under three-run
  union aggregation.
- Real-world validation showed high precision in the strongest single-run
  condition, with **94.4% precision** and **F1 = 0.399**.
- The AI-derived workload estimate assigned higher overall workload to the
  defective website (**60.8/100**) than to the improved website (**13.3/100**),
  matching the direction reported by participants (**51.65** versus **12.1**).
- In the tool comparison, the assistant achieved **83.5% aggregate accuracy**,
  **32.5% ground-truth recall**, and **F1 = 0.468** across the evaluated
  fixtures.
- The assistant detected source-level JavaScript and TSX issues that were not
  consistently covered by the other evaluated tools.

These results do not show that the assistant replaces manual testing,
assistive-technology testing, or established automated tools. The workload
estimate is a directional proxy, not a substitute for participant-reported
NASA-TLX measurement, and static analysis cannot reliably infer every runtime or
interaction-dependent barrier.

## Repository

| Area | Contents |
| --- | --- |
| [VS Code extension](extension/ai-accessibility-assistant/) | Extension source and package metadata |
| [RAG service](services/rag/) | FastAPI RAG and Ollama proxy service |
| [Knowledge base](knowledge-base/) | WCAG/accessibility and NASA-TLX documents |
| [Evaluation harnesses](evaluation/) | Reproducible evaluation scripts and fixtures |
| [Research results](research-results/) | Experimental outputs and model-testing results |
| [Dissertation](docs/dissertation/) | Dissertation source, figures, references, and PDF |
| [Study materials](docs/study-materials/) | Study materials, validation sheets, and surveys |

The repository includes both implementation and research material. Generated
build output, local dependencies, ChromaDB data, environment files, and VS Code
test folders are excluded through [`.gitignore`](.gitignore).

## Licence and reuse

Original software code is available under the MIT terms in
[`LICENSE`](LICENSE). The dissertation text and figures are subject to MCAST
copyright and publication rules; research data and participant materials have
additional restrictions described in that file. Third-party material remains
subject to its own licence.

For citation metadata, see [`CITATION.cff`](CITATION.cff).

Study 5 contains the approved evaluation records used for the dissertation:

- [Developer validation records](research-results/Study%205%20-%20real-world-validation/developer-validation/)
- [Developer validation master sheet](research-results/Study%205%20-%20real-world-validation/developer-validation/Developer_Validation_Master_Sheet.xlsx)
- [Developer study information](research-results/Study%205%20-%20real-world-validation/developer-validation/Study%20Information.xlsx)
- [Vision-impaired participant materials](research-results/Study%205%20-%20real-world-validation/Vision-impaired%20participants/)

These materials are included as research material; do not add new identifying
information when extending the dataset.

## Environment

The extension is developed for:

- Visual Studio Code **1.108 or later**
- Node.js and npm
- TypeScript **5.9**
- ESLint **9**
- esbuild **0.27**

The RAG service uses:

- Python
- FastAPI
- ChromaDB
- `all-MiniLM-L6-v2` through ChromaDB's default embedding function
- BM25 keyword retrieval
- `httpx`
- Ollama for local model inference

Install the service dependencies and run it from the repository root with:

```bash
python -m pip install -r services/rag/requirements.txt
python -m uvicorn services.rag.app:app --host 127.0.0.1 --port 8000
```

The extension defaults to local Ollama and RAG endpoints:
`http://localhost:11434` and `http://localhost:8000`. Change the VS Code
settings `aiAccessibilityAssistant.ollamaHost` and
`aiAccessibilityAssistant.ragEndpoint` when using a different deployment.

## Extension quick start

```bash
cd extension/ai-accessibility-assistant
npm install
npm run compile
```

Open the repository in VS Code, launch the extension using the project's
extension-development workflow, and open the **Accessibility Assistant** view
from the activity bar. The available development and test commands are defined
in [`extension/ai-accessibility-assistant/package.json`](extension/ai-accessibility-assistant/package.json).

## Evaluation quick start

The evaluation folders contain their own scripts and instructions. The
tool-comparison study can be run with:

```bash
cd evaluation/tool-comparison
npm install
npm run study6:compare:all
```

The NASA-TLX test harness can be run with:

```bash
cd evaluation/nasa-tlx/test-harness
npm install
npm test
```

See the [tool-comparison README](evaluation/tool-comparison/README.md) and
[NASA-TLX README](evaluation/nasa-tlx/README.md) for study-specific
methodology, fixtures, and output descriptions. The complete implementation
and result locations are also available for [Study 1](evaluation/model-screening/),
[Study 2](evaluation/parameter-evaluation/), [Study 3](evaluation/detailed-evaluation/),
[Study 4](evaluation/nasa-tlx/), and [Study 6](evaluation/tool-comparison/).
Study 5's records and materials are linked above.

## Known limitations

- Static source analysis cannot fully observe rendered DOM state, runtime
  behaviour, live-region timing, or assistive-technology interaction.
- JavaScript and TSX analysis can produce false positives for ARIA and
  event-handler patterns whose correctness depends on runtime behaviour.
- Physical workload is difficult to infer from source code alone.
- The RAG service requires its knowledge base, embedding store, and compatible
  model endpoint to be available.
- Experimental results depend on model, prompt, retrieval, and aggregation
  settings. The dissertation's reported metrics should not be generalised
  beyond the evaluated fixtures and participants.

## Dissertation

[Read the submitted dissertation (PDF)](docs/dissertation/dissertation.pdf).

The dissertation source is in
[`docs/dissertation/`](docs/dissertation/),
including the methodology, results, discussion, appendices, figures, and
references.

## Citation

If you use this repository, its software, or its evaluation material, cite the
dissertation.

### IEEE

```text
M. F. Vella, "Evaluating Multimodal Accessibility and Cognitive Load using AI:
A Predictive and Educational Tool for Web Designers and Developers,"
B.Sc. (Hons) dissertation, Institute of Information and Communication Technology,
MCAST, Malta, 2026.
```

### Harvard

```text
Vella, M.F. (2026) Evaluating Multimodal Accessibility and Cognitive Load using AI:
A Predictive and Educational Tool for Web Designers and Developers. BSc (Hons)
dissertation. MCAST Institute of Information and Communication Technology.
```

### APA

```text
Vella, M. F. (2026). Evaluating Multimodal Accessibility and Cognitive Load using
AI: A Predictive and Educational Tool for Web Designers and Developers [BSc (Hons)
dissertation, MCAST Institute of Information and Communication Technology].
```

### BibTeX

```bibtex
@thesis{vella2026multimodal,
  author      = {Mireya Francesca Vella},
  title       = {Evaluating Multimodal Accessibility and Cognitive Load using AI:
                 A Predictive and Educational Tool for Web Designers and Developers},
  type        = {BSc (Hons) dissertation},
  institution = {MCAST Institute of Information and Communication Technology},
  year        = {2026}
}
```
