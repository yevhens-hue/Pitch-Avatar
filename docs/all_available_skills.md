# All Available AI Agent Skills

This document contains a comprehensive list of all AI agent skills currently available in this workspace. These skills can be invoked by the AI agent to retrieve guidelines, checklists, and automated helpers for specific tasks.

---

## 🌐 1. Web Development, UI/UX & Debugging

| Skill Name | Description | Trigger Prompt Examples |
| :--- | :--- | :--- |
| **`modern-web-guidance`** | Search tool for modern web development best practices (Layouts, Scroll, Performance, Web APIs). | *"Use modern-web-guidance to look up CSS container queries..."* |
| **`chrome-devtools`** | Uses Chrome DevTools MCP for debugging, troubleshooting, and browser automation. | *"Open browser and test this flow..."* |
| **`chrome-extensions`** | Build and publish Chrome Extensions using Manifest V3 best practices. | *"Create a Chrome extension manifest.json..."* |
| **`a11y-debugging`** | Audits semantic HTML, ARIA labels, focus states, tap targets, and color contrast. | *"Audit accessibility of this page..."* |
| **`debug-optimize-lcp`** | Guides debugging and optimizing Largest Contentful Paint (LCP) performance. | *"Debug why our LCP loading speed is low..."* |
| **`memory-leak-debugging`** | Diagnoses and resolves memory leaks in JavaScript/Node.js applications. | *"Analyze this heap snapshot for memory leaks..."* |
| **`troubleshooting`** | Troubleshoots connection and target issues for DevTools. | *"Fix DevTools connection issue..."* |

---

## 🏗️ 2. Development Process, Planning & Quality Assurance

| Skill Name | Description | Trigger Prompt Examples |
| :--- | :--- | :--- |
| **`diagnose`** | Disciplined loop for hard bugs and performance regressions: Reproduce → Minimise → Hypothesise → Instrument → Fix → Test. | *"Diagnose why this function is failing..."* |
| **`improve-codebase-architecture`** | Evaluates refactoring, consolidation, and modularization opportunities. | *"Find architectural improvement opportunities in src/services..."* |
| **`prototype`** | Builds a throwaway prototype to test state machine or UI designs. | *"Prototype a mockup for the analytics dashboard..."* |
| **`tdd`** | Test-driven development with red-green-refactor loop. | *"Write tests first using TDD for this new service..."* |
| **`grill-me`** | Conducts a relentless design interview to stress-test your plans. | *"/grill-me on this implementation plan..."* |
| **`grill-with-docs`** | Refines and challenges designs against existing domain models. | *"Challenge this design with our ADR documents..."* |
| **`accidental-data-loss-prevention`** | Critical verification check to prevent accidental deletion of database or storage data. | *(Runs automatically before destructive commands)* |
| **`to-prd`** | Turns the current chat transcript into a Product Requirements Document (PRD). | *"Generate a PRD from this conversation..."* |
| **`to-issues`** | Breaks down a PRD or plan into individual developer tickets. | *"Break this plan down into issues..."* |
| **`triage`** | Manages, triages, and updates issue tickets. | *"Triage incoming bugs..."* |
| **`handoff`** | Creates a handoff document of the current session for another agent. | *"Handoff current state..."* |

---

## 📊 3. Product Management & Analytics

| Skill Name | Description | Trigger Prompt Examples |
| :--- | :--- | :--- |
| **`product-feature-prioritization`** | Scores backlog items using RICE, ICE, MoSCoW, or Kano frameworks. | *"Prioritize these backlog features using RICE..."* |
| **`product-spec-generator`** | Generates PRDs, User Stories, and Given/When/Then Acceptance Criteria. | *"Generate a specification for our billing widget..."* |
| **`ab-testing-planner`** | Plans A/B tests, estimates traffic requirements, and evaluates p-value. | *"Plan an A/B test for our upgrade button..."* |
| **`user-feedback-analyst`** | Processes support tickets and reviews to identify key user pain points. | *"Extract main complaints from this user feedback..."* |
| **`competitor-research`** | Researches competitor pricing, feature offerings, and user reviews. | *"Do competitor research on tool X..."* |
| **`changelog-generator`** | Creates user-friendly release notes and changelogs from git history. | *"Generate release notes for version 1.2..."* |

---

## ☁️ 4. Google Cloud (GCP) & Data Engineering

| Skill Name | Description | Trigger Prompt Examples |
| :--- | :--- | :--- |
| **`building-data-apps`** | Builds data apps and dashboards (React+Vite or Streamlit) from GCP sources. | *"Build a Streamlit dashboard querying BigQuery..."* |
| **`developing-with-bigquery`** | Optimizes BigQuery SQL queries, BigFrames Python code, and ML models. | *"Optimize this BigQuery SQL query..."* |
| **`discovering-gcp-data-assets`** | Finds and inspects schemas/metadata for GCP datasets and tables. | *"Find tables related to billing in GCP..."* |
| **`dataform-bigquery`** | Generates Dataform SQLX pipeline code for BigQuery ELT. | *"Create a Dataform pipeline for analytics..."* |
| **`dbt-bigquery`** | Creates and optimizes dbt pipelines for BigQuery. | *"Add a new dbt model for session logs..."* |
| **`gcp-data-pipelines`** | Coordinates Beam, Dataproc, DTS, or Dataform pipelines on GCP. | *"Build a data ingestion pipeline from GCS..."* |
| **`gcp-dataflow`** | Builds, packages, and debugs Apache Beam pipelines on Dataflow. | *"Write a python Dataflow pipeline template..."* |
| **`gcp-spark`** | Develops and executes Spark jobs on Dataproc Serverless. | *"Run a Spark batch job to process history logs..."* |
| **`gcp-pipeline-orchestration`** | Generates Airflow DAGs for Cloud Composer pipeline orchestration. | *"Create a Composer DAG to trigger our dbt models..."* |
| **`gcp-pipeline-resource-provisioning`** | Provisions datasets, tables, and transfer configs via `deployment.yaml`. | *"Add a new BigQuery table to our deployment config..."* |
| **`gcp-composer-troubleshooting`** | Diagnoses and resolves failed Cloud Composer/Airflow pipelines. | *"Troubleshoot why our Airflow DAG failed..."* |
| **`bigquery-data-transfer-service`** | Inspects and configures DTS pipelines for automated data ingestion. | *"Check DTS configuration status..."* |
| **`data-autocleaning`** | Applies data cleaning and schema mapping best practices to GCS/BQ pipelines. | *"Clean raw logs before saving to BigQuery..."* |
| **`notebook-guidance`** | Guides Jupyter notebook usage and BQSQL magic cells. | *"Create a python notebook to analyze user retention..."* |
| **`gcloud-auth-verification`** | Resolves missing Google Cloud authentication and credentials issues. | *"Fix authentication error when querying BigQuery..."* |

---

## 🧬 5. Bio-Informatics, Chemistry & Literature Databases

| Skill Name | Description | Trigger Prompt Examples |
| :--- | :--- | :--- |
| **`uniprot-database`** | Resolves protein names, maps IDs, and fetches sequences. | *"Search UniProt for human TP53 protein details..."* |
| **`ensembl-database`** | Fetches gene models, transcript definitions, and genome sequences. | *"Get genomic sequence for BRCA1 gene..."* |
| **`pdb-database`** | Searches 3D biomolecular structures and downloads PDB coordinate files. | *"Find crystal structures of human insulin receptor..."* |
| **`alphafold-database-fetch-and-analyze`**| Retrieves structural confidence metrics (pLDDT) from AlphaFold. | *"Fetch AlphaFold structure for protein Q13541..."* |
| **`protein-sequence-msa`** | Performs Clustal Omega multiple sequence alignment. | *"Align these five protein sequences..."* |
| **`protein-sequence-similarity-search`** | Runs similarity searches using MMseqs2 or BLAST. | *"Find homologous proteins for this FASTA sequence..."* |
| **`pymol`** | Superimposes, renders, and visualizes molecular structures using PyMOL. | *"Generate a PyMOL script to show ligand binding site..."* |
| **`foldseek-structural-search`** | Runs 3D shape similarity searches on protein structure files. | *"Search Foldseek using this structure.pdb file..."* |
| **`dbsnp-database`** | Resolves rsIDs, maps coordinates, and queries SNP variants. | *"Look up SNP rs4988235 in dbSNP..."* |
| **`clinvar-database`** | Checks pathogenicity classifications (Pathogenic, VUS, Benign) of genomic variants.| *"Check clinical significance of variant in ClinVar..."* |
| **`gnomad-database`** | Evaluates allele frequency and loss-of-function intolerance scores. | *"Get allele frequency for rs121913527 in gnomAD..."* |
| **`gtex-database`** | Retrieves quantitative tissue-specific RNA expression and eQTLs. | *"Compare TP53 gene expression across GTEx tissues..."* |
| **`human-protein-atlas-database`** | Retrieves protein expression and cellular localization profiles. | *"Find cellular localization of lamin A in HPA..."* |
| **`chembl-database`** | Queries bioactivity data (IC50, Ki) and approved drug listings. | *"Find target binding affinity values for Aspirin..."* |
| **`pubchem-database`** | Looks up compound properties, structures, and chemical formulas. | *"Get IUPAC name and structure for Ibuprofen..."* |
| **`openfda-database`** | Queries FDA drug adverse events, recalls, and shortages. | *"Search FDA adverse events for Ibuprofen..."* |
| **`clinical-trials-database`** | Queries ClinicalTrials.gov for recruiting phases, locations, and outcomes. | *"Find active Phase III clinical trials for Melanoma..."* |
| **`opentargets-database`** | Identifies target-disease associations and tractability classifications. | *"Find therapeutic targets associated with Alzheimer..."* |
| **`reactome-database`** | Runs pathway enrichment analysis and pathway mapping. | *"Perform pathway enrichment analysis for this gene list..."* |
| **`string-database`** | Queries protein-protein interaction networks and confidence scores. | *"Get interaction network partners for human TP53..."* |
| **`quickgo-database`** | Maps genes to Gene Ontology (GO) biological processes and cellular roles. | *"Get GO annotations for human insulin receptor..."* |
| **`ncbi-sequence-fetch`** | Retrieves sequences from GenBank, RefSeq, and Nucleotide databases. | *"Fetch nucleotide sequence for accession NM_000546..."* |
| **`embl-ebi-ols`** | Searches ontological hierarchies, synonyms, and definitions in OLS. | *"Search OLS for ontology term 'apoptosis'..."* |
| **`jaspar-database`** | Queries position frequency matrices for transcription factor profiles. | *"Get JASPAR binding profile for CTCF..."* |
| **`unibind-database`** | Fetches validated genomic coordinates for transcription factor binding sites. | *"Download validated binding site coordinates for CTCF..."* |
| **`encode-ccres-database`** | QueriesENCODE cis-regulatory elements (cCREs) across human cells. | *"Query ENCODE regulatory regions near chr17:7660000..."* |
| **`ucsc-conservation-and-tfbs`** | Queries conservation scores (phyloP) and transcription factor tracks. | *"Get evolutionary conservation scores for this genomic locus..."* |
| **`pubmed-database`** | Searches medical literature and fetches titles/abstracts. | *"Search PubMed for recent articles on CRISPR therapeutics..."* |
| **`literature-search-arxiv`** | Searches arXiv preprints and research papers. | *"Search arXiv for papers on LLMs in coding..."* |
| **`literature-search-biorxiv`** | Searches bioRxiv/medRxiv preprints by category. | *"Search bioRxiv for preprints on protein folding..."* |
| **`literature-search-openalex`** | Queries the OpenAlex database for citation counts and authors. | *"Find h-index and publication metrics for author..."* |
| **`literature-search-europepmc`** | Searches Europe PMC database and fetches full-text XML. | *"Search Europe PMC for articles on gene editing..."* |

---

## ⚙️ 6. System & Agent Utilities

| Skill Name | Description | Trigger Prompt Examples |
| :--- | :--- | :--- |
| **`managing-python-dependencies`** | Installs and manages packages using virtual environments. | *"Install packages needed for this script..."* |
| **`uv`** | Fast Python package management helper. | *(Checks and configures `uv` package manager)* |
| **`android-cli`** | Orchestrates build diagnostics, SDK installations, and Android CLI. | *"Run android environment diagnostics..."* |
| **`caveman`** | Ultra-compressed conversation mode to save token costs. | *"/caveman mode"* |
| **`write-a-skill`** | Walkthrough and template for creating new AI agent skills. | *"Create a new skill for AWS deployment..."* |
| **`workflow-skill-creator`** | Packages your successful workflow steps into a reusable skill. | *"Package our last deployment steps into a skill..."* |
| **`skill-repair`** | Reinstalls or fixes malfunctioning agent skills. | *"Fix broken skill installation..."* |
| **`ai-team`** | Invokes a collaborative panel of specialized agents (CTO, Engineer). | *"Ask the AI team to debate this backend layout..."* |
