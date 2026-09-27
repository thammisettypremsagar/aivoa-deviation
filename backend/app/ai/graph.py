import json
import os
from typing import TypedDict

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END

load_dotenv()


class DeviationState(TypedDict, total=False):
    text: str
    extracted: dict
    assessment: dict


llm = ChatGroq(
    model_name="openai/gpt-oss-120b",
    temperature=0
)

def clean_json(content):
    """Convert the AI response into a Python dictionary."""

    if isinstance(content, list):
        content = "".join(
            block.get("text", "")
            if isinstance(block, dict)
            else str(block)
            for block in content
        )

    content = content.strip()

    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    return json.loads(content)


def extract_deviation(state: DeviationState):
    prompt = f"""
You are an AI assistant for a pharmaceutical API manufacturing company.

Extract deviation information from the following deviation report.

IMPORTANT:
- Only extract information actually present in the text.
- Do not invent missing information.
- If a field is missing, return an empty string.
- Return ONLY valid JSON.
- Do not include markdown.

Required JSON format:

{{
    "site": "",
    "date": "",
    "title": "",
    "source": "",
    "product": "",
    "batch": "",
    "description": ""
}}

Deviation report:

{state["text"]}
"""

    response = llm.invoke(prompt)

    extracted = clean_json(response.content)

    return {
        "extracted": extracted
    }


def assess_impact(state: DeviationState):
    prompt = f"""
You are an AI quality assistant for a pharmaceutical manufacturing company.

Analyze the following extracted deviation information.

Determine:
1. Potential impact on product/process quality.
2. Initial severity.
3. A short reason for the severity.

Severity must be exactly one of:

Low
Medium
High
Critical

Return ONLY valid JSON.

Required format:

{{
    "impact": "",
    "severity": "",
    "severity_reason": ""
}}

Extracted deviation:

{json.dumps(state["extracted"], indent=2)}
"""

    response = llm.invoke(prompt)

    assessment = clean_json(response.content)

    return {
        "assessment": assessment
    }


# Create LangGraph workflow
workflow = StateGraph(DeviationState)

workflow.add_node("extract_deviation", extract_deviation)
workflow.add_node("assess_impact", assess_impact)

workflow.add_edge(START, "extract_deviation")
workflow.add_edge("extract_deviation", "assess_impact")
workflow.add_edge("assess_impact", END)

graph = workflow.compile()


def run_deviation_ai(text: str):
    result = graph.invoke({
        "text": text
    })

    return {
        **result["extracted"],
        **result["assessment"]
    }
def edit_deviation_with_ai(instruction: str, current_data: dict):
    prompt = f"""
You are an AI assistant for a pharmaceutical deviation management system.

The user wants to modify information that is already present in the deviation form.

Current deviation data:
{json.dumps(current_data, indent=2)}

User instruction:
{instruction}

Apply ONLY the changes requested by the user.

Rules:
- Keep all existing values that the user did not ask to change.
- Do not invent new information.
- Return the complete updated deviation data.
- Valid severity values are: Low, Medium, High, Critical.
- Return ONLY valid JSON.
- Do not include markdown.

Return this exact structure:

{{
    "site": "",
    "date": "",
    "title": "",
    "source": "",
    "product": "",
    "batch": "",
    "description": "",
    "impact": "",
    "severity": "",
    "severity_reason": ""
}}
"""

    response = llm.invoke(prompt)
    return clean_json(response.content)