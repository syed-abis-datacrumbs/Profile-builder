// AUTO-PORTED from the DataCrumbs LMS GitHub builder (rolePresets.ts) so the
// prototype loads the SAME role content. The preset data below is copied
// verbatim from the LMS; a small map turns its skillicon ids into readable
// badge names, and applyRolePresetToGithub() adapts a preset onto the
// prototype's GithubProfileData shape (title/about/techStack/customSections).
import { GithubProfileData } from '../types';

export interface GithubRolePreset {
  id: string;
  label: string;
  about: string;
  expertise: string;
  techStack: string[];
  extraBadges?: { label: string; color: string }[];
  projects: { name: string; desc: string; slug: string }[];
}

const TECH_NAME_MAP: Record<string, string> = {
  "py": "Python",
  "r": "R",
  "sklearn": "scikit-learn",
  "pytorch": "PyTorch",
  "tensorflow": "TensorFlow",
  "anaconda": "Anaconda",
  "postgres": "PostgreSQL",
  "fastapi": "FastAPI",
  "docker": "Docker",
  "aws": "AWS",
  "git": "Git",
  "opencv": "OpenCV",
  "kubernetes": "Kubernetes",
  "redis": "Redis",
  "mysql": "MySQL",
  "sqlite": "SQLite",
  "d3": "D3.js",
  "grafana": "Grafana",
  "bash": "Bash",
  "scala": "Scala",
  "kafka": "Apache Kafka",
  "elasticsearch": "Elasticsearch",
  "terraform": "Terraform",
  "githubactions": "GitHub Actions",
  "prometheus": "Prometheus",
  "cpp": "C++",
  "ts": "TypeScript",
  "js": "JavaScript",
  "react": "React",
  "nextjs": "Next.js",
  "nodejs": "Node.js",
  "express": "Express",
  "tailwind": "TailwindCSS",
  "prisma": "Prisma",
  "html": "HTML5",
  "css": "CSS3",
  "sass": "Sass",
  "vite": "Vite",
  "redux": "Redux",
  "cypress": "Cypress",
  "figma": "Figma",
  "go": "Go",
  "nestjs": "NestJS",
  "swift": "Swift",
  "kotlin": "Kotlin",
  "dart": "Dart",
  "java": "Java",
  "firebase": "Firebase",
  "graphql": "GraphQL",
  "jenkins": "Jenkins",
  "linux": "Linux",
  "nginx": "NGINX",
  "ansible": "Ansible"
};

export const GITHUB_ROLE_PRESETS: GithubRolePreset[] = [
  {
    id: "data-science",
    label: "Data Science",
    about:
      "I'm a data scientist who works at the seam between messy production data and decisions people actually act on. Most of my time goes into supervised learning for churn, demand, and risk problems — gradient boosting and transformer fine-tuning where they earn their keep, plain logistic regression where they don't — plus the unglamorous work around it: point-in-time-correct feature pipelines, leakage audits, and calibration checks that keep a model honest after month three. I'm equally comfortable writing the SQL that defines a metric, the PyTorch training loop that models it, and the FastAPI service that serves it under a latency budget.\n\nI believe a model is only as good as the decision it changes, so I start from the counterfactual: what would happen without this, and how would we know? That means baselines before architectures, holdout designs that survive contact with seasonality, and experiments that measure the business outcome rather than a proxy that flatters the model. I write down assumptions where reviewers can see them, prefer an interpretable model I can defend to a stakeholder over a half-point of AUC I can't, and treat monitoring and drift alerts as part of shipping rather than a follow-up ticket. Good analysis should also be legible — I aim for a chart and three sentences that a non-technical reader can repeat correctly.",
    expertise:
      "**Predictive Modeling & Machine Learning** — I build and tune supervised models for tabular, time-series, and text problems, from regularized GLMs and gradient-boosted trees to fine-tuned transformers, with disciplined cross-validation and probability calibration.\n\n**Experimentation & Causal Inference** — I design and analyze A/B tests, switchback trials, and quasi-experiments using CUPED, difference-in-differences, and uplift modeling to separate real treatment effects from selection and seasonality.\n\n**Feature Engineering & Data Pipelines** — I turn raw event and transactional data into reproducible, point-in-time-correct feature sets with SQL, Spark, and orchestrated Airflow DAGs that the same code can serve at training and inference time.\n\n**Model Deployment & Monitoring** — I package models behind versioned APIs in Docker, track runs and artifacts in MLflow, and instrument drift, calibration, and latency alerts so degradation is caught before stakeholders notice it.",
    techStack: ["py", "r", "sklearn", "pytorch", "tensorflow", "anaconda", "postgres", "fastapi", "docker", "aws", "git"],
    extraBadges: [{ label: "Jupyter", color: "F37626" }, { label: "Pandas", color: "150458" }, { label: "Apache Spark", color: "E25A1C" }, { label: "MLflow", color: "0194E2" }, { label: "Airflow", color: "017CEE" }],
    projects: [
      { name: "Churn Uplift Model", desc: "Two-model uplift learner (T-learner over XGBoost) trained on 480K subscriber histories that raised retention-campaign ROI 31% while targeting half as many customers.", slug: "churn-uplift-model" },
      { name: "Demand Forecasting", desc: "LightGBM ensemble with a seasonal-naive baseline across 1,200 SKU-store pairs cut weekly forecast MAPE from 18.4% to 9.7% and released $240K of safety stock.", slug: "retail-demand-forecast" },
      { name: "Feature Store", desc: "Airflow and Feast pipeline serving 340 point-in-time-correct features that reduced training-set assembly from 6 hours to 11 minutes and eliminated three known leakage paths.", slug: "pit-feature-store" },
      { name: "Sequential A/B Engine", desc: "mSPRT sequential testing with CUPED variance reduction shortened median experiment runtime from 21 to 12 days at unchanged 80% power and 5% false-positive rate.", slug: "sequential-ab-engine" },
      { name: "Ticket Triage NLP", desc: "Fine-tuned DistilBERT classifier over 90K support tickets reached 0.91 macro-F1 and auto-routes 62% of inbound volume at 34 ms p95 inference on CPU.", slug: "support-ticket-triage" },
      { name: "Fraud Anomaly Detection", desc: "Isolation Forest combined with graph-derived device and payee features catches 87% of confirmed payment fraud at a 0.4% false-positive rate, avoiding roughly $1.1M in annual losses.", slug: "fraud-anomaly-detection" },
    ],
  },
  {
    id: "ai-ml-engineer",
    label: "AI/ML Engineer",
    about:
      "I build machine learning systems that survive contact with production traffic. Most of my work sits between research and infrastructure: fine-tuning transformers with LoRA and QLoRA, training gradient-boosted models on messy tabular data, and then doing the unglamorous part — quantizing checkpoints, batching requests, wiring feature pipelines, and making sure the thing that scored well in a notebook still scores well at 2 a.m. under load. Lately most of my time goes to LLM applications: retrieval pipelines, evaluation harnesses, distillation, and inference cost work, because that is where the gap between a demo and a dependable product is currently widest.\n\nI care more about measurement than about model choice. Before I train anything I want a held-out evaluation set that reflects real user inputs and a baseline dumb enough to be embarrassing — half the time the baseline wins, and that saves months. I treat data quality, labeling guidelines, and error analysis as first-class engineering work rather than preprocessing, and I would rather ship a smaller model I can monitor, roll back, and explain than a larger one nobody can debug. Reproducibility is non-negotiable: pinned seeds, versioned datasets, tracked experiments, and a training run anyone on the team can reproduce from a single command.",
    expertise:
      "**Model Development & Fine-Tuning** — I train and adapt deep learning and gradient-boosted models, using LoRA/QLoRA, mixed-precision training, and systematic hyperparameter search to squeeze real accuracy gains out of limited compute and imperfect labels.\n\n**LLM & Retrieval Systems** — I design retrieval-augmented pipelines end to end, from chunking strategy and embedding choice through hybrid search, cross-encoder reranking, structured tool calling, and prompt-level guardrails.\n\n**ML Infrastructure & Serving** — I take models to production with containerized inference, ONNX/TensorRT optimization, dynamic batching, GPU autoscaling, and reproducible training pipelines that run the same on a laptop and on a cluster.\n\n**Evaluation & Monitoring** — I build offline evaluation harnesses, LLM-as-judge rubrics, and online drift and quality dashboards so regressions are caught by an alert rather than by a customer.",
    techStack: ["py", "pytorch", "tensorflow", "sklearn", "opencv", "fastapi", "docker", "kubernetes", "aws", "postgres", "redis"],
    extraBadges: [{ label: "Jupyter", color: "F37626" }, { label: "Hugging Face", color: "FFD21E" }, { label: "MLflow", color: "0194E2" }, { label: "Weights & Biases", color: "FFBE00" }],
    projects: [
      { name: "Hybrid RAG Router", desc: "Combined BM25 with bge-large embeddings and a cross-encoder reranker, lifting answer accuracy from 71% to 89% on a 2,400-question benchmark while cutting prompt tokens by 38%.", slug: "hybrid-rag-router" },
      { name: "LLM Distillation", desc: "Distilled a 7B instruction model into a 1.3B student with sequence-level knowledge distillation plus LoRA, retaining 96% of judge-scored quality at 4.2x throughput and 71% lower serving cost.", slug: "llm-distillation-pipeline" },
      { name: "Inference Optimizer", desc: "Converted PyTorch checkpoints to TensorRT with INT8 calibration and dynamic batching on Triton, dropping p99 latency from 480ms to 96ms on the same A10G fleet.", slug: "triton-serving-optimizer" },
      { name: "Defect Vision QC", desc: "Fine-tuned YOLOv8 with albumentations-based augmentation for factory surface inspection, reaching 0.94 mAP@0.5 at 38ms per frame on a Jetson Orin edge device.", slug: "defect-vision-qc" },
      { name: "Feature Store", desc: "Built a Kafka-to-Redis online feature layer with point-in-time correct backfills, removing training/serving skew worth 6 AUC points and serving features at 11ms p99.", slug: "streaming-feature-store" },
      { name: "Drift Watchdog", desc: "Implemented PSI and Kolmogorov-Smirnov drift detection with automated retraining triggers, surfacing model degradation an average of 9 days earlier across 14 production models.", slug: "model-drift-monitor" },
    ],
  },
  {
    id: "data-analytics",
    label: "Data Analytics",
    about:
      "I turn messy, high-volume operational data into decisions people actually act on. Most of my work sits between the warehouse and the boardroom: writing the SQL models that make a metric trustworthy, running the experiments that prove a change worked, and building the dashboards that let a non-technical team answer their own questions at 8am without pinging an analyst. I work mainly in Python and SQL against Postgres and MySQL warehouses, with R for the statistics-heavy work — survival curves, mixed-effects models, and anything where the confidence interval matters more than the point estimate.\n\nI believe an analysis is only as good as the definition behind the number, so I start every project by writing down what the metric means and who disagrees with that definition. I'd rather ship one well-instrumented KPI that survives scrutiny than forty charts nobody trusts. I version-control every query, document assumptions in the notebook next to the result, and always report the uncertainty alongside the headline. And when the data says the idea didn't work, I say so plainly — a fast, honest negative result is worth more than a flattering one.",
    expertise:
      "**SQL & Dimensional Data Modeling** — I design star-schema marts and incremental transformation layers that turn raw event tables into governed, reusable metrics with a single source of truth.\n\n**Experimentation & Causal Inference** — I design and read A/B and quasi-experimental studies using power analysis, CUPED variance reduction, and difference-in-differences when randomization isn't possible.\n\n**Forecasting & Predictive Modeling** — I build time-series and classification models (SARIMAX, gradient boosting, survival analysis) with backtested error bounds rather than single-split accuracy claims.\n\n**Dashboarding & Data Storytelling** — I build self-serve dashboards and executive narratives that lead with the decision, expose the assumptions, and load fast enough that people actually use them.",
    techStack: ["py", "r", "postgres", "mysql", "sqlite", "anaconda", "sklearn", "d3", "grafana", "bash", "git"],
    extraBadges: [{ label: "Jupyter", color: "F37626" }],
    projects: [
      { name: "Churn Cohorts", desc: "Combined RFM segmentation with a gradient-boosted churn classifier (0.87 AUC) across 480K subscribers, driving a targeted win-back campaign that cut monthly voluntary churn from 6.2% to 4.1%.", slug: "churn-cohort-analysis" },
      { name: "Demand Forecast", desc: "Replaced spreadsheet extrapolation with a SARIMAX and Prophet ensemble across 1,200 SKUs, reducing forecast MAPE from 18% to 7.4% and stockout incidents by 23%.", slug: "retail-demand-forecast" },
      { name: "Warehouse Refactor", desc: "Rebuilt 140 ad-hoc SQL scripts into a tested, incremental transformation project, dropping the nightly warehouse run from 3h10m to 26 minutes and compute spend by 38%.", slug: "sql-warehouse-refactor" },
      { name: "Executive KPI Hub", desc: "Served 22 company KPIs from Postgres materialized views into Grafana at a 1.4s p95 load over three years of history, retiring nine manual spreadsheets and about 30 analyst-hours per month.", slug: "exec-kpi-dashboard" },
      { name: "Experiment Toolkit", desc: "Packaged sequential testing with CUPED variance reduction into a reusable Python library, cutting required sample sizes 41% and shortening the median experiment from 21 days to 12.", slug: "ab-test-toolkit" },
      { name: "Data Quality Monitor", desc: "Added schema, freshness, and STL-residual anomaly checks to 60 warehouse tables, catching 94% of pipeline breakages within 15 minutes instead of at the next morning's standup.", slug: "data-quality-monitor" },
    ],
  },
  {
    id: "data-engineer",
    label: "Data Engineer",
    about:
      "I build and operate the data platforms that sit between messy source systems and the teams who depend on them. Most of my work is pipeline engineering at scale: change-data-capture streams out of transactional Postgres and MySQL into Kafka, Spark and Flink jobs that reshape those events, and a warehouse layer modeled in dbt that analysts and ML engineers actually trust. I care as much about the unglamorous parts — backfills that can be rerun safely, schema changes that do not silently break a dashboard at 6am, storage layouts tuned so a query scans gigabytes instead of terabytes — as about the architecture diagrams. Day to day that means Python and SQL, Airflow for orchestration, Terraform and Kubernetes for the infrastructure underneath, and a lot of time reading query plans.\n\nMy working philosophy is that a data pipeline is a product with users, not a script that happens to run on a schedule. Every table I ship has an owner, a freshness expectation, and tests that fail loudly before a stakeholder notices something is wrong. I default to idempotent, replayable designs so that recovery is boring, and I treat schema contracts between producers and consumers as real commitments rather than informal agreements. I am also deliberate about cost: compute is easy to throw at a slow job and expensive to keep throwing, so I profile before I scale. Above all, I would rather deliver a smaller set of well-documented, dependable datasets than a sprawling warehouse nobody can reason about.",
    expertise:
      "**Batch & Distributed Processing** — I design partitioned, incremental Spark and SQL workloads that process terabyte-scale datasets predictably, using bucketing, broadcast joins, and file compaction to keep shuffle and scan costs under control.\n\n**Streaming & Event Ingestion** — I build low-latency ingestion paths with Kafka, Debezium change-data-capture, and Flink stateful processing, handling exactly-once semantics, watermarks, and late-arriving events without losing correctness.\n\n**Data Modeling & Warehouse Design** — I model dimensional and wide-table layers in dbt across Snowflake, BigQuery, and Postgres, balancing incremental materialization strategies against query performance and downstream usability.\n\n**Orchestration, Quality & Platform Reliability** — I run Airflow on Kubernetes with infrastructure defined in Terraform, and instrument every pipeline with freshness checks, volume anomaly detection, and lineage so failures are caught upstream of the consumer.",
    techStack: ["py", "scala", "kafka", "postgres", "mysql", "redis", "elasticsearch", "docker", "kubernetes", "aws", "terraform", "grafana"],
    extraBadges: [{ label: "Apache Spark", color: "E25A1C" }, { label: "Apache Airflow", color: "017CEE" }, { label: "dbt", color: "FF694A" }, { label: "Snowflake", color: "29B5E8" }, { label: "Databricks", color: "FF3621" }],
    projects: [
      { name: "Lakehouse Migration", desc: "Migrated 340 Hive tables to Delta Lake with Z-ordering and scheduled OPTIMIZE compaction, cutting median query scan time from 42s to 3.8s and S3 storage spend by 61%.", slug: "lakehouse-delta-migration" },
      { name: "CDC Ingestion", desc: "Streamed change-data-capture from 12 sharded Postgres databases into Kafka using Debezium with Avro and Schema Registry, sustaining 45k events/sec at sub-800ms end-to-end replication lag.", slug: "cdc-postgres-kafka" },
      { name: "DAG Factory", desc: "Replaced 1,200 hand-written Airflow DAG files with a YAML-driven generator and shared operator library, dropping new pipeline onboarding from three days to roughly 40 minutes.", slug: "airflow-dag-factory" },
      { name: "Warehouse Core", desc: "Refactored 280 dbt models to incremental materialization with 900 assertion tests, shrinking the nightly warehouse build from 5h10m to 48m and reducing Snowflake credit burn by 38%.", slug: "dbt-analytics-core" },
      { name: "Data Quality Guard", desc: "Deployed Great Expectations suites plus seasonal volume and freshness anomaly detection that caught 94% of upstream schema breaks before dashboards, taking data incidents from 17 to 2 per quarter.", slug: "pipeline-quality-guard" },
      { name: "Session Analytics", desc: "Implemented Flink stateful sessionization with a RocksDB state backend and bounded-lateness watermarks, emitting rolling engagement metrics over 2.1B events/day at 1.4s p99 latency.", slug: "flink-sessionization" },
    ],
  },
  {
    id: "mlops-engineer",
    label: "MLOps Engineer",
    about:
      "I'm an MLOps engineer who lives in the gap between a notebook that works and a model that keeps working at 3 a.m. on a holiday weekend. Most of my time goes into the unglamorous plumbing that makes machine learning boring in the best way: reproducible training pipelines, versioned data and artifacts, containerized inference services that autoscale on real traffic, and promotion gates that refuse to ship a model whose shadow-traffic behavior has quietly diverged from its offline metrics. I work day to day in Python, Docker and Kubernetes, wire everything together with Terraform and GitHub Actions, and instrument it with Prometheus and Grafana so model health is a dashboard anyone on the team can read rather than tribal knowledge held by whoever trained it.\n\nMy working philosophy is that a model is a production dependency, not a deliverable, so it deserves the same rigor as any other service: versioning, rollback, SLOs, on-call runbooks and a cost budget. I automate the path from commit to endpoint until it is genuinely dull, because every manual step is a place where a stale feature transform or an untracked hyperparameter sneaks into production. I care about training-serving parity, about making an experiment reproducible six months later by someone who was not there, and about being honest with quantified evidence — latency percentiles, drift statistics and dollars per thousand inferences — instead of vague claims that a system is fast or reliable. Good MLOps work should let data scientists move faster while making it harder for anyone, including me, to break production.",
    expertise:
      "**ML Pipeline Automation & CI/CD** — I design end-to-end training pipelines with orchestrated DAGs, cached step artifacts and strict data/model versioning so any run reproduces exactly and every candidate passes automated evaluation gates before promotion.\n\n**Model Serving & Inference Scaling** — I deploy models behind containerized, autoscaling inference services using dynamic batching, GPU sharing and canary or shadow rollouts to hold latency SLOs under bursty production traffic.\n\n**Monitoring, Drift & Reliability** — I instrument data drift, prediction distribution shifts and feature freshness with statistical tests and metric exporters, wiring alerts and runbooks that catch silent model degradation before users do.\n\n**Platform Infrastructure & Cost Engineering** — I provision reproducible ML platforms as code on Kubernetes and cloud managed services, tuning spot instances, GPU scheduling and resource requests to keep per-inference cost predictable and low.",
    techStack: ["py", "bash", "pytorch", "fastapi", "docker", "kubernetes", "terraform", "aws", "githubactions", "prometheus", "grafana", "postgres"],
    extraBadges: [{ label: "MLflow", color: "0194E2" }, { label: "Airflow", color: "017CEE" }, { label: "Kubeflow", color: "345CB1" }, { label: "DVC", color: "13ADC7" }],
    projects: [
      { name: "Feature Store Sync", desc: "Unified offline and online feature serving with a Feast-on-Redis materialization job, eliminating 87% of training-serving skew incidents while holding p99 feature lookup at 6 ms across 240 features.", slug: "feature-store-sync" },
      { name: "Drift Sentinel", desc: "Population Stability Index and KS-test drift monitors exported to Prometheus, surfacing 9 silent model regressions and cutting mean time to detection from 11 days to under 4 hours.", slug: "drift-sentinel" },
      { name: "Triton Autoscaler", desc: "KEDA-driven GPU autoscaling for Triton Inference Server with dynamic batching, reducing monthly inference spend from $18.4k to $6.8k while keeping p95 latency below 110 ms.", slug: "triton-inference-autoscaler" },
      { name: "Pipeline Forge", desc: "Templated Kubeflow training pipelines with content-addressed step caching, shrinking full retraining wall-clock from 6.5 hours to 48 minutes and skipping roughly 90% of redundant compute.", slug: "kubeflow-pipeline-forge" },
      { name: "Registry Gate", desc: "GitHub Actions promotion gate running shadow evaluation and fairness checks against the MLflow model registry, blocking 14 regressive candidates and driving the production rollback rate down to 0.6%.", slug: "model-registry-gate" },
      { name: "ML Platform IaC", desc: "Reusable Terraform modules provisioning EKS node groups, IRSA roles and inference endpoints, cutting new-team environment setup from about 3 weeks of tickets to a 25-minute apply.", slug: "terraform-ml-platform" },
    ],
  },
  {
    id: "computer-vision",
    label: "Computer Vision Engineer",
    about:
      "I build computer vision systems that hold up outside the lab — models that keep their accuracy when the lighting shifts, the camera drifts out of focus, or an object shows up at an angle nobody labeled. Most of my work sits at the intersection of deep learning and deployment: training detection and segmentation networks in PyTorch, then compressing and compiling them to run on the hardware that actually exists on site — Jetson boards, ARM CPUs, industrial cameras with a 30ms frame budget. I spend as much time on data pipelines, annotation quality, and failure-case mining as I do on architectures, because in vision the dataset is usually the model.\n\nI believe a vision system is only as good as its worst lighting condition, so I evaluate on hard slices rather than headline mAP — night frames, motion blur, occlusion, small objects, underrepresented classes. I treat every model as something a teammate will have to debug at 2am, which means versioned datasets, reproducible training configs, and visual diagnostics committed next to the code. I would rather ship a smaller network that runs in real time on the customer's existing hardware than a heavyweight one that only wins on a benchmark leaderboard, and I would rather return a calibrated confidence score than a confident wrong answer.",
    expertise:
      "**Object Detection & Segmentation** — I train and fine-tune detection, instance segmentation, and keypoint models such as YOLO, DETR, Mask R-CNN, and SAM, using anchor tuning, hard-negative mining, and aggressive augmentation for long-tailed classes.\n\n**Edge Deployment & Inference Optimization** — I move trained networks onto constrained hardware through ONNX/TensorRT conversion, INT8 quantization, structured pruning, and knowledge distillation to meet strict real-time latency budgets.\n\n**3D Vision & Camera Geometry** — I work with stereo depth, intrinsic and extrinsic calibration, structure-from-motion, point-cloud registration, and multi-view pose estimation where classical geometry outperforms or stabilizes a learned model.\n\n**Data Pipelines & Annotation Quality** — I design labeling workflows, active-learning loops, and synthetic data generation, then audit label noise and class balance to gain accuracy from the dataset instead of the architecture.",
    techStack: ["py", "cpp", "pytorch", "tensorflow", "opencv", "sklearn", "fastapi", "docker", "linux", "aws", "git"],
    extraBadges: [{ label: "Jupyter", color: "F37626" }],
    projects: [
      { name: "EdgeDetect", desc: "Quantized a YOLOv8-s defect detector to INT8 with TensorRT, cutting inference from 84ms to 11ms per frame on a Jetson Orin Nano while losing only 0.8 mAP.", slug: "edge-detect-trt" },
      { name: "WeldSeam QC", desc: "Deployed a U-Net weld-seam segmentation model on a production line that caught 96.4% of porosity defects and reduced manual inspection labor by 22 hours per week.", slug: "weldseam-qc" },
      { name: "StereoDepth Kit", desc: "Implemented semi-global block matching with sub-pixel refinement and Zhang calibration, achieving 4.7mm mean depth error at 2 meters on a 12cm stereo baseline.", slug: "stereodepth-kit" },
      { name: "ActiveLabel", desc: "Built an entropy plus core-set active-learning loop that reached target mAP@0.5 of 0.81 using 6,200 labeled images instead of 24,000, cutting annotation spend by roughly $31k.", slug: "activelabel-loop" },
      { name: "TrackFlow", desc: "Combined ByteTrack with a ReID embedding head to cut identity switches by 63% across 40 hours of multi-camera retail footage at 28 FPS on a single T4.", slug: "trackflow-mot" },
      { name: "SynthAug", desc: "Generated 45,000 domain-randomized Blender renders that lifted real-world small-object recall from 0.52 to 0.79 with no additional human annotation.", slug: "synthaug-pipeline" },
    ],
  },
  {
    id: "bi-analyst",
    label: "Business Intelligence Analyst",
    about:
      "I turn messy operational data into decisions people actually make. Most of my week is spent between the warehouse and the meeting room: modeling raw event and transaction tables into clean, governed fact and dimension layers, writing SQL that finance and growth teams can trust without a caveat, and shipping dashboards that answer the question behind the question. I work across the full analytics path — ingestion checks, dbt transformations, metric definitions, semantic layers, and the last mile of visual design in Power BI, Tableau, and Looker — with Python and R for the analysis that a BI tool cannot express, like cohort decay curves, attribution models, and SKU-level demand forecasts.\n\nI believe a metric is only as good as its definition, so I define it once, document it, and defend it everywhere. Dashboards that nobody opens are a cost, not an asset, which is why I start with the decision a stakeholder needs to make and work backwards to the numbers rather than shipping every chart the data allows. I treat analytics code like production code — version controlled, tested, peer reviewed, and monitored — because a silently broken pipeline erodes trust far faster than a slow one. And I would rather deliver an honest estimate with stated uncertainty than a precise number that quietly hides a bad join.",
    expertise:
      "**Dimensional Modeling & Semantic Layers** — I design star schemas, slowly changing dimensions, and dbt-governed metric definitions so that every team calculates revenue, churn, and active users the same way.\n\n**SQL & Warehouse Performance Tuning** — I rewrite heavy analytical queries using window functions, incremental materializations, partitioning, and clustering keys to cut both dashboard latency and warehouse spend.\n\n**Dashboard Design & Self-Service Enablement** — I build Power BI, Tableau, and Looker experiences with clear visual hierarchy, drill paths, and row-level security so business users answer their own questions without filing a ticket.\n\n**Statistical Analysis & Forecasting** — I run A/B tests, cohort and funnel analyses, attribution models, and time-series forecasts in Python and R, always reporting effect sizes and confidence intervals alongside the point estimate.",
    techStack: ["py", "r", "postgres", "mysql", "sklearn", "kafka", "grafana", "d3", "docker", "aws", "git"],
    extraBadges: [{ label: "Jupyter", color: "F37626" }, { label: "Power BI", color: "F2C811" }, { label: "Tableau", color: "E97627" }, { label: "dbt", color: "FF694A" }, { label: "Snowflake", color: "29B5E8" }, { label: "Looker", color: "4285F4" }, { label: "Airflow", color: "017CEE" }],
    projects: [
      { name: "Revenue Semantic Layer", desc: "Consolidated 42 conflicting revenue metrics into a single dbt semantic layer with incremental materializations, cutting the monthly finance close dashboard refresh from 38 minutes to 4.", slug: "revenue-semantic-layer" },
      { name: "Churn Radar", desc: "Scored 260K B2B accounts weekly with a gradient-boosted churn model (0.83 AUC) that flagged 71% of churners 30 days early and drove retention offers protecting $410K in ARR.", slug: "churn-early-warning" },
      { name: "Cohort Explorer", desc: "Built a DuckDB-backed retention explorer that renders 24-month cohort triangles over 18M events in under 900ms, replacing a spreadsheet process that took an analyst two days per month.", slug: "cohort-retention-explorer" },
      { name: "Attribution Rebalance", desc: "Replaced last-click reporting with a Markov chain removal-effect model in R, reallocating $1.2M of annual spend and lifting blended ROAS by 23%.", slug: "multitouch-attribution" },
      { name: "Warehouse Sentinel", desc: "Instrumented 180 critical tables with Great Expectations and dbt freshness tests, catching 96% of anomalies before they reached dashboards and reducing bad-data incidents from 11 per quarter to 1.", slug: "warehouse-data-quality" },
      { name: "Demand Forecast", desc: "Forecast 3,400 SKUs weekly with SARIMA and Prophet ensembles at 8.4% MAPE, trimming overstock by 17% and freeing $260K in annual carrying cost.", slug: "demand-forecast-sku" },
    ],
  },
  {
    id: "full-stack",
    label: "Full Stack Developer",
    about:
      "I build and ship complete web products — from the database schema and API contracts all the way to the accessible, responsive interface a user actually touches. Most of my work lives in the TypeScript ecosystem: Next.js and React on the front end, Node with Express or NestJS behind it, and Postgres accessed through Prisma. I care about the unglamorous parts that decide whether a product survives contact with real traffic: pagination that doesn't fall over at a million rows, background jobs that retry safely, auth flows that handle the edge cases, and CI that catches regressions before a customer does. I've taken projects from an empty repo to production on AWS and Vercel, and I've also inherited five-year-old codebases and made them fast again.\n\nI believe the fastest way to build something good is to make it observable and reversible. I ship small changes behind feature flags, instrument before I optimize, and let profiler output rather than intuition decide what gets rewritten. I write the tests that would have caught last month's incident instead of chasing a coverage number, and I treat a clear error message or a well-named migration as part of the feature, not as overhead. Code is read far more often than it is written, so I optimize for the engineer who opens the file six months from now — including when that engineer is me.",
    expertise:
      "**Frontend Architecture** — I build React and Next.js interfaces with server components, streaming SSR, and a strict accessibility and Core Web Vitals budget so pages stay fast on mid-range mobile devices.\n\n**API & Backend Services** — I design REST and GraphQL services in Node and TypeScript with layered validation, idempotent write endpoints, rate limiting, and queued background jobs for anything slower than a request cycle.\n\n**Data Modeling & Persistence** — I model relational schemas in Postgres, write and review migrations, tune indexes and query plans, and use Redis for caching and session state where it measurably cuts response time.\n\n**Deployment & Reliability** — I containerize services with Docker, automate build, test, and release through GitHub Actions, and keep systems observable with structured logging, dashboards, and alerts tied to real user-facing symptoms.",
    techStack: ["ts", "js", "react", "nextjs", "nodejs", "express", "tailwind", "prisma", "postgres", "redis", "docker", "githubactions"],
    projects: [
      { name: "Commerce Storefront", desc: "Rebuilt a headless storefront on the Next.js App Router with ISR and edge caching, cutting largest contentful paint from 4.1s to 1.2s and lifting checkout conversion by 18%.", slug: "commerce-storefront-nextjs" },
      { name: "Realtime Board", desc: "Implemented a collaborative whiteboard using WebSockets with Yjs CRDT merging and Redis pub/sub fan-out, sustaining 200 concurrent editors per room at under 80ms sync latency.", slug: "realtime-collab-board" },
      { name: "Billing API", desc: "Designed an idempotent Stripe webhook pipeline with a Postgres outbox table and exponential-backoff retries, eliminating duplicate charges and raising failed-invoice recovery from 61% to 94%.", slug: "subscription-billing-api" },
      { name: "Query Optimizer", desc: "Profiled the ten slowest endpoints with pg_stat_statements and added partial and composite indexes, dropping p95 API latency from 870ms to 130ms with no application rewrite.", slug: "postgres-query-audit" },
      { name: "Design System", desc: "Shipped a 42-component Radix and Tailwind library with Storybook docs and Chromatic visual regression tests, reducing new feature UI build time by about 40% across four product teams.", slug: "react-design-system" },
      { name: "Deploy Pipeline", desc: "Replaced a manual release process with multi-stage Docker builds and a GitHub Actions test matrix, taking deploys from 35 minutes to 6 and enabling ten production releases a week.", slug: "docker-ci-pipeline" },
    ],
  },
  {
    id: "frontend",
    label: "Frontend Developer",
    about:
      "I'm a frontend developer who builds interfaces that stay fast and accessible as products grow. Most of my work lives in React and TypeScript, where I spend as much time on rendering behavior, bundle budgets, and state boundaries as I do on the visual layer. I've shipped design systems consumed by several product teams, rebuilt checkout and dashboard flows around Core Web Vitals targets, and migrated legacy client-rendered apps to the Next.js App Router without breaking SEO or existing integrations. I care about the details users feel but rarely name: a layout that doesn't shift, a form that recovers from a failed request, a table that stays usable at ten thousand rows.\n\nI believe the browser is a constraint, not a canvas — every megabyte of JavaScript is a tax someone pays on a mid-range phone over a slow connection. So I start from semantic HTML and progressive enhancement, reach for a library only when the platform genuinely falls short, and treat accessibility as a build requirement rather than an audit item. I write components other people can read, keep visual regression and interaction tests close to the code they protect, and prefer measured performance work over intuition. Good frontend work should feel invisible: the interface simply does what the user expected, quickly, on whatever device they happened to open.",
    expertise:
      "**Component Architecture & Design Systems** — I build typed, composable component libraries with tokenized theming and Storybook documentation so multiple product teams ship consistent UI without forking styles.\n\n**Web Performance Engineering** — I profile with Lighthouse, React DevTools, and real-user metrics to cut bundle weight, eliminate layout shift, and hit Core Web Vitals thresholds through code splitting, streaming SSR, and image optimization.\n\n**Accessibility & Semantic Markup** — I implement WCAG 2.2 AA interfaces with correct ARIA semantics, focus management, and keyboard navigation, verified through axe automation and real screen reader testing.\n\n**State & Data Layer Integration** — I model client and server state deliberately with React Query, Redux Toolkit, and GraphQL fragments, using optimistic updates and cache invalidation to keep UI responsive under unreliable networks.",
    techStack: ["ts", "js", "react", "nextjs", "tailwind", "html", "css", "sass", "vite", "redux", "cypress", "figma"],
    projects: [
      { name: "Atlas UI Kit", desc: "A headless React component library built on Radix primitives and Tailwind design tokens, adopted by 4 product teams and cutting new-feature UI build time from 3 days to 6 hours.", slug: "atlas-ui-kit" },
      { name: "Vitals Budget", desc: "A GitHub Actions check that runs Lighthouse CI on every pull request and blocks merges pushing LCP past 2.5s, holding 75th-percentile LCP at 1.8s across 14 months of releases.", slug: "vitals-budget-ci" },
      { name: "Grid Virtuoso", desc: "A virtualized data grid using windowed rendering and column pinning that scrolls 50,000 rows at a steady 60fps while keeping live DOM nodes under 400.", slug: "grid-virtuoso" },
      { name: "Route Splitter", desc: "A Vite plugin that analyzes route-level imports and auto-generates dynamic boundaries, shrinking the initial JavaScript bundle from 780KB to 210KB gzipped.", slug: "route-splitter" },
      { name: "A11y Sentinel", desc: "A Cypress and axe-core test harness wired into CI that caught 137 WCAG violations across 40 pages and lifted the accessibility audit score from 68 to 98.", slug: "a11y-sentinel" },
      { name: "Checkout Rewrite", desc: "A Next.js App Router checkout using server actions and optimistic cart updates that reduced form abandonment by 23% and cut time-to-interactive by 1.9 seconds on 3G.", slug: "nextjs-checkout-flow" },
    ],
  },
  {
    id: "backend",
    label: "Backend Developer",
    about:
      "I build and operate the services that sit behind the product — HTTP and gRPC APIs, relational data models, background workers, and the message pipelines that connect them. Most of my work lives in Go, TypeScript, and Python on Postgres and Redis, deployed as containers on Kubernetes. I care about the parts users never see directly but always feel: a query plan that stops doing a sequential scan, an idempotency key that prevents a double charge, a migration that ships without a maintenance window. I am comfortable owning a service end to end, from the schema design conversation through the on-call page at 3 a.m.\n\nI default to boring technology and reach for something new only when I can name the specific constraint it solves. Before I optimize anything I measure it, because the bottleneck is almost never where the team assumed it was. I treat API contracts as promises — versioned, backward compatible, and documented in the same pull request as the code — and I write tests that describe behavior rather than mirror implementation. Good backend work should be legible to the next engineer, observable when it misbehaves, and cheap enough to run that nobody has to argue about the bill.",
    expertise:
      "**API Design & Service Architecture** — I design versioned REST and gRPC interfaces with clear resource boundaries, pagination rules, and error contracts that clients can depend on for years.\n\n**Data Modeling & Query Performance** — I normalize schemas for correctness, then earn the speed back with the right indexes, query plans, and connection pooling rather than premature caching.\n\n**Distributed Systems & Async Messaging** — I build event-driven flows with Kafka and queue-backed workers using the outbox pattern, idempotent consumers, and retry policies that survive partial failure.\n\n**Reliability & Observability** — I instrument services with structured logs, traces, and RED metrics and run them against explicit SLOs, so incidents are diagnosed in minutes instead of guessed at for hours.",
    techStack: ["go", "ts", "py", "nodejs", "nestjs", "postgres", "redis", "kafka", "docker", "kubernetes", "aws", "terraform"],
    projects: [
      { name: "Ledger API", desc: "Replaced N+1 ORM access with cursor pagination and covering indexes, dropping p99 read latency from 840 ms to 96 ms across a 12M-row transaction table.", slug: "ledger-service" },
      { name: "Rate Limiter", desc: "Redis sliding-window limiter written in Go with atomic Lua scripts, sustaining 45k requests/sec at under 1 ms of added overhead per call.", slug: "distributed-rate-limiter" },
      { name: "Order Events", desc: "Kafka consumer group using the transactional outbox pattern and idempotency keys, delivering 3.2M order events per day with zero duplicate charges over nine months.", slug: "order-events-pipeline" },
      { name: "Auth Gateway", desc: "OAuth2 service with rotating JWTs and edge-cached JWKS verification, cutting auth-related database load by 78% and login p95 from 410 ms to 120 ms.", slug: "oauth2-auth-gateway" },
      { name: "Job Runner", desc: "Postgres SKIP LOCKED work queue that processes 12k jobs per minute on four workers and retired a managed queue subscription costing $1,400/month.", slug: "async-job-runner" },
      { name: "Cluster Autoscaler", desc: "KEDA autoscaling driven by queue depth instead of CPU, trimming Kubernetes spend 41% ($3,800/month) while holding p95 processing time under 200 ms.", slug: "k8s-queue-autoscaler" },
    ],
  },
  {
    id: "software-engineer",
    label: "Software Engineer",
    about:
      "I am a software engineer who works across the full request path — from a React component's first paint down to the index a Postgres query planner actually chooses. Most of my work sits in TypeScript and Python services that handle real traffic: payment flows, search, background job pipelines, and the APIs that tie them together. I like the parts of the job other people find tedious — reading query plans, chasing a p99 that only misbehaves under concurrency, untangling a migration that has to run against a live table. Lately I have spent most of my time on backend performance and on making deploys boring: idempotent writes, transactional outboxes, feature-flagged rollouts, and CI that finishes before you lose focus.\n\nI believe the hardest part of engineering is not writing code but keeping a system understandable a year later. So I optimize for clarity over cleverness: small, well-named modules, explicit boundaries between layers, and tests that document intent rather than lock in implementation details. I measure before I optimize, because instinct about hot paths is usually wrong, and I ship in small reversible increments so a bad decision costs an hour instead of a quarter. Code review is where I learn the most, and I try to leave comments that explain reasoning rather than just flag style. When something breaks in production, I care more about the blameless write-up and the guardrail that follows than about who pushed the commit.",
    expertise:
      "**Backend & API Engineering** — I design REST and GraphQL services in Node.js and Python with clear contracts, idempotent write paths, and background job queues that survive retries and partial failures.\n\n**Data Modeling & Query Performance** — I schema-design for Postgres, read execution plans, and tune indexes, connection pooling, and caching layers to keep tail latency predictable as tables grow.\n\n**Frontend Product Engineering** — I build accessible, type-safe interfaces in React and Next.js, with attention to rendering strategy, bundle size, and the loading states users actually experience.\n\n**Delivery & Reliability Engineering** — I own the path from commit to production: containerized builds, parallelized CI, staged rollouts behind feature flags, and the alerts that catch regressions before customers do.",
    techStack: ["ts", "js", "py", "react", "nextjs", "nodejs", "postgres", "redis", "docker", "kubernetes", "aws", "githubactions"],
    projects: [
      { name: "Checkout Gateway", desc: "Introduced idempotency keys and a transactional outbox on the payment write path, eliminating duplicate charges across 2.4M transactions per month.", slug: "idempotent-checkout-gateway" },
      { name: "Query Tuner", desc: "Instrumented the ORM to surface N+1 access patterns, then replaced them with covering indexes and cursor pagination, cutting p95 API latency from 840ms to 110ms.", slug: "orm-query-profiler" },
      { name: "Read-Through Cache", desc: "Added a Redis stale-while-revalidate cache in front of the product catalog, absorbing 87% of read traffic and reducing database spend by $4,100 per month.", slug: "swr-redis-cache-layer" },
      { name: "CI Sharder", desc: "Bin-packed a 2,100-case Jest suite across 12 parallel GitHub Actions runners using historical timings, shrinking CI from 34 minutes to 6.", slug: "ci-test-sharder" },
      { name: "Rollout Flags", desc: "Shipped percentage-based feature flags with automatic rollback on error-budget breach, dropping mean time to recovery from 41 minutes to 7 across 300 releases.", slug: "progressive-rollout-flags" },
      { name: "Postgres Search", desc: "Replaced a third-party search API with weighted tsvector and trigram indexes, serving 3.2M documents at 45ms p99 and removing an $1,800 monthly vendor bill.", slug: "pg-trigram-search" },
    ],
  },
  {
    id: "mobile-app",
    label: "Mobile App Developer",
    about:
      "I build iOS and Android apps, mostly in Swift with SwiftUI and Kotlin with Jetpack Compose, and I reach for Flutter or React Native when a project genuinely needs one codebase on both stores. Most of my time goes into the layer users feel without naming it: how long the app takes to draw its first usable screen, whether a long list still scrolls smoothly on a four-year-old mid-range phone, and what happens when the network dies halfway through a form. Lately that has meant startup profiling with Macrobenchmark and Instruments, and offline-first storage on SQLite and Room with background sync through WorkManager. I test on a Pixel 4a and an iPhone SE instead of only on emulators, because cheap hardware is where the problems actually show up.\n\nI also set up the unglamorous parts myself: Fastlane and GitHub Actions pipelines so a tagged commit reaches TestFlight without a manual build, golden-file tests on shared UI components, and instrumented tests on the two or three flows that would hurt most if they broke. I check accessibility, dynamic type, and dark mode with VoiceOver and TalkBack before I open a pull request, because retrofitting them later costs far more than building them in. Most of this experience comes from personal projects, freelance builds, and coursework rather than a large production team, so the numbers below are ones I measured myself on my own code and can walk through commit by commit. What I want next is mobile work where I own features end to end and get reviewed by people who have shipped at a bigger scale than I have.",
    expertise:
      "**Native iOS & Android Development** — I build features natively in Swift/SwiftUI and Kotlin/Jetpack Compose, including camera capture with AVFoundation and CameraX, push notifications, and scheduled background work.\n\n**Cross-Platform Delivery** — I structure Flutter and React Native codebases into feature modules with platform channels for the parts that must be native, so both stores build from one branch without behavior drift.\n\n**Startup & Frame Performance** — I profile with Macrobenchmark, Instruments, and the Android Studio profiler to find what blocks the first frame or drops frames mid-scroll, then fix it with Baseline Profiles, lazy initialization, and proper list recycling.\n\n**Offline Storage & Background Sync** — I model local-first data in SQLite, Room, and Drift and reconcile it through WorkManager and BGTaskScheduler jobs that survive process death, choosing last-writer-wins or CRDT merges based on how the data is edited.",
    techStack: ["swift", "kotlin", "dart", "ts", "js", "java", "react", "firebase", "graphql", "sqlite", "githubactions", "figma"],
    extraBadges: [{ label: "Flutter", color: "02569B" }, { label: "Jetpack Compose", color: "4285F4" }, { label: "Fastlane", color: "00F200" }, { label: "Xcode", color: "147EFB" }, { label: "Android Studio", color: "3DDC84" }],
    projects: [
      { name: "Aurora Fit", desc: "Jetpack Compose fitness tracker where Baseline Profiles, lazy App Startup initialization, and R8 full mode cut cold start on a Pixel 4a from 2.4s to 780ms, measured over 50 Macrobenchmark runs.", slug: "aurora-fit-tracker" },
      { name: "Offline Ledger", desc: "Offline-first expense ledger on SQLite with CRDT merges and a WorkManager retry queue that replayed 4,200 entries queued during a simulated six-hour outage with zero lost writes and 0.3% needing manual conflict review.", slug: "offline-first-ledger" },
      { name: "Pulse Chat", desc: "React Native chat client on Hermes and FlashList that renders a 10,000-message thread at a median 58fps, up from 31fps on the FlatList implementation it replaced.", slug: "pulse-chat-rn" },
      { name: "ScanPay SDK", desc: "Card-scanning library shipped as an XCFramework and an AAR, using Vision and ML Kit text recognition to read a card number in a median 1.1s at 96% accuracy across 200 test cards.", slug: "scanpay-mobile-sdk" },
      { name: "Flight Deck", desc: "Fastlane and GitHub Actions pipeline with match code signing that takes a tagged commit to TestFlight and Firebase App Distribution unattended in 11 minutes, replacing a 40-minute manual build, with dependency caching cutting billable CI minutes 38%.", slug: "flight-deck-mobile-ci" },
      { name: "Lumen Kit", desc: "Flutter design system of 62 themed widgets backed by 140 golden-file tests and WCAG AA contrast checks in CI, reused across three of my own apps and catching 20+ visual regressions before merge.", slug: "lumen-mobile-design-kit" },
    ],
  },
  {
    id: "devops",
    label: "DevOps Engineer",
    about:
      "I am a DevOps Engineer who treats infrastructure as a product: versioned, tested, and observable. Most of my day is spent shortening the distance between a merged pull request and a safe production release — writing Terraform modules that teams can consume without reading the AWS docs, tuning Kubernetes autoscaling so services survive traffic spikes without over-provisioning, and building GitHub Actions and Jenkins pipelines that fail loudly in CI instead of quietly at 2 a.m. I have run blue/green and canary rollouts for services handling millions of requests a day, migrated hand-built EC2 fleets into reproducible EKS clusters, and cut cloud bills by finding the gap between what a workload requested and what it actually used.\n\nI believe the best operations work is the work nobody notices, and that reliability comes from boring, repeatable systems rather than heroics. Every change should be reversible, every incident should end in a blameless write-up with a concrete action item, and every alert should be actionable — a pager that cries wolf is worse than no pager at all. I default to automating anything I have done manually twice, writing the runbook before I hand a system over, and giving developers self-service tooling so they own their deployments instead of filing tickets. Security and cost are not afterthoughts I bolt on at the end; they belong in the same pipeline as the tests.",
    expertise:
      "**Infrastructure as Code** — I design modular, reusable Terraform and Ansible codebases with remote state, policy checks, and plan-review gates so any environment can be rebuilt from scratch on demand.\n\n**Container Orchestration** — I run production Kubernetes clusters end to end, covering Helm packaging, autoscaler tuning, network policies, resource quotas, and zero-downtime rollout strategies.\n\n**CI/CD and Release Engineering** — I build pipelines in GitHub Actions, GitLab CI, and Jenkins with parallel test stages, artifact caching, automated security scanning, and progressive delivery with fast rollback.\n\n**Observability and Incident Response** — I instrument systems with Prometheus, Grafana, and structured logging, define SLOs and error budgets, and turn noisy dashboards into a small set of alerts that map directly to runbooks.",
    techStack: ["docker", "kubernetes", "terraform", "ansible", "aws", "githubactions", "jenkins", "prometheus", "grafana", "linux", "bash", "nginx"],
    projects: [
      { name: "Terraform Landing Zone", desc: "Multi-account AWS landing zone built from reusable Terraform modules with Terragrunt, cutting new environment provisioning from three days of manual setup to a 25-minute pipeline run.", slug: "aws-terraform-landing-zone" },
      { name: "Pipeline Accelerator", desc: "Rebuilt a monorepo GitHub Actions pipeline with dependency-aware job graphs, Docker layer caching, and matrix parallelism, dropping average CI time from 34 minutes to 6.", slug: "monorepo-ci-accelerator" },
      { name: "Karpenter Cost Tuning", desc: "Migrated an EKS platform to Karpenter with Spot-first node pools and right-sized resource requests, reducing monthly compute spend by 41% with no change to p99 latency.", slug: "eks-karpenter-cost-tuning" },
      { name: "Progressive Delivery", desc: "Introduced Argo Rollouts canary deploys gated on Prometheus error-rate queries, auto-aborting 12 bad releases and lowering change failure rate from 18% to 3%.", slug: "argo-canary-rollouts" },
      { name: "Observability Stack", desc: "Deployed a Prometheus, Thanos, and Grafana stack with SLO-based alerting that cut alert volume by 78% while reducing mean time to detect from 14 minutes to under 2.", slug: "slo-observability-stack" },
      { name: "Supply Chain Hardening", desc: "Replaced env-file secrets with Vault dynamic credentials and added Trivy scanning plus cosign image signing to every build, eliminating all long-lived static keys across 60 services.", slug: "vault-supply-chain-hardening" },
    ],
  },
];

/** Adapts an LMS role preset onto the prototype's GithubProfileData. Identity
 *  fields (username, socials, cards, theme) are kept; only the README content
 *  is replaced — mirroring the LMS applyRolePreset. */
export function applyRolePresetToGithub(
  data: GithubProfileData,
  preset: GithubRolePreset,
): GithubProfileData {
  const techStack = [
    ...preset.techStack.map((id) => TECH_NAME_MAP[id] ?? id),
    ...(preset.extraBadges?.map((b) => b.label) ?? []),
  ];
  const projectsMd = preset.projects
    .map((p) => `**${p.name}** — ${p.desc}`)
    .join('\n\n');
  return {
    ...data,
    username: preset.id === 'custom' ? 'your-github-username' : data.username,
    title: preset.id === 'custom' ? 'Hi 👋' : preset.label,
    socialLinks: preset.id === 'custom' ? { linkedin: '', twitter: '', email: '', website: '' } : data.socialLinks,
    about: preset.about,
    techStack,
    customSections: preset.id === 'custom' ? [] : [
      { title: '💡 Expertise', content: preset.expertise },
      { title: '🚀 Featured Projects', content: projectsMd },
    ],
  };
}
