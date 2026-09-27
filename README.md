\# AIVOA.AI – AI-Powered Deviation Management System



\## Overview



This project is an AI-powered Deviation Management module for pharmaceutical API manufacturing.



It allows users to upload a deviation PDF or paste deviation details. AI extracts the relevant information, assesses the potential impact and severity, and populates the deviation form for user review.



\## Features



\- PDF deviation document extraction

\- AI-powered deviation information extraction

\- AI impact assessment

\- AI severity recommendation

\- User review and editing

\- AI-assisted form editing

\- Deviation saving to PostgreSQL

\- REST APIs using FastAPI

\- LangGraph-based AI workflow

\- Redux state management



\## Workflow



PDF / Text Input  

↓  

PDF Text Extraction  

↓  

AI Information Extraction  

↓  

Impact \& Severity Assessment  

↓  

Populate Deviation Form  

↓  

User Review / AI Edit  

↓  

Save Deviation to PostgreSQL



\## Tech Stack



\### Frontend

\- React

\- Redux Toolkit

\- Axios

\- Vite



\### Backend

\- Python

\- FastAPI

\- LangGraph

\- Groq

\- PyMuPDF

\- SQLAlchemy



\### Database

\- PostgreSQL



\## Project Structure



```text

aivoa-deviation/

├── frontend/

│   └── React application

│

└── backend/

&#x20;   └── FastAPI application

