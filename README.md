# TaskForge - AI Productivity Agent

## 1. System Design Document

### 1.1. System Concept

**Manual Task:** The manual task this project automates is the daily process of creating a to-do list, scheduling tasks, and categorizing them.

**AI Agent Prototype:** The **TaskForge AI** agent is a full-stack application that allows a user to input a list of raw tasks. The agent then reasons about these tasks, generates a structured daily plan, and automatically categorizes each task. The system provides a user interface for monitoring, editing, and executing this plan.

**Originality & Social Impact:** This project goes beyond a simple to-do list by leveraging the planning and reasoning capabilities of a Large Language Model (LLM). The social impact is to improve user productivity and well-being by automating a common, repetitive task, reducing cognitive load, and helping users stay organized.

### 1.2. Architecture

The application uses a **full-stack client-server architecture** with a clear separation of concerns.

- **Frontend (Client):** A web application built with **Next.js 14** that provides the user interface.
- **Backend (Server):** A **Python FastAPI** server that exposes RESTful API endpoints.
- **AI Agent (Model):** A local LLM running on **Ollama** that handles the core planning and reasoning tasks.
- **Data Persistence:** User data is stored in a **SQLite** database for user accounts and in user-specific **JSON files** for task plans.

### 1.3. Component Breakdown

- **Frontend UI**: Built with Next.js, TypeScript, and Tailwind CSS.
- **Backend API**: A Python FastAPI application that manages all data and AI logic.
- **Authentication**: Secure user registration and login using JWTs for session management.
- **Data Persistence**: A SQLite database for users and JSON files for tasks.
- **AI Agent**: The Ollama client that communicates with the local LLM.

### 1.4. Chosen Technologies and Reasoning

- **Next.js 14**: Chosen for its robust App Router for routing, server components for performance, and a streamlined development experience with TypeScript and Tailwind CSS.
- **Python FastAPI**: Selected for its speed, automatic data validation with Pydantic, and built-in API documentation.
- **Ollama**: A key choice for running a local LLM, which provides a completely free and private solution, avoiding the costs and rate limits of hosted APIs.
- **SQLite**: A lightweight, file-based database that is ideal for a prototype, as it requires no complex setup.

## 2. Deliverables

- **Source Code**: The complete source code for the prototype is available in this repository.
- **System Design Document**: This README serves as the design document, outlining the architecture, components, and technology choices.
- **Interaction Logs**: The full chat history with the AI assistant that provided guidance throughout development serves as the interaction logs.

## 3. Developer & AI Assistant

- **Developer:** Karnati Supriya
- **University:** Indian Institute of Technology, Patna
- **Department:** Computer Science and Engineering

**AI Assistant:** This project was developed with guidance from Gemini, a large language model trained by Google. The complete interaction logs are submitted with this project.
