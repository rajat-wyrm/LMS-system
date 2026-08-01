from chatbot import CourseChatbot
from vector_store import VectorStore
from langchain_ollama import ChatOllama

EVAL_PROMPT = """
Expected Response: {expected_response}
Actual Response: {actual_response}
---
(Answer with 'true' or 'false') Does the actual response match the expected response? 
"""


def test_monopoly_rules():
    assert query_and_validate(
        question="How much total money does a player start with in Monopoly? (Answer with the number only)",
        expected_response="$1500",
    )


def test_ticket_to_ride_rules():
    assert query_and_validate(
        question="How many points does the longest continuous train get in Ticket to Ride? (Answer with the number only)",
        expected_response="10 points",
    )


def query_and_validate(question: str, expected_response: str):
    vstore = VectorStore()
    bot = CourseChatbot(vstore)
    response_text, _sources = bot.get_response(question)
    
    prompt = EVAL_PROMPT.format(
        expected_response=expected_response, actual_response=response_text
    )

    model = ChatOllama(model="mistral")
    evaluation_results = model.invoke(prompt)
    evaluation_results_str_cleaned = evaluation_results.content.strip().lower()

    print(f"Question: {question}")
    print(f"Expected: {expected_response}")
    print(f"Actual: {response_text}")
    print(f"Evaluation: {evaluation_results_str_cleaned}")

    if "true" in evaluation_results_str_cleaned:
        print("\033[92m" + "Result: PASS" + "\033[0m")
        return True
    elif "false" in evaluation_results_str_cleaned:
        print("\033[91m" + "Result: FAIL" + "\033[0m")
        return False
    else:
        print(f"Invalid evaluation result: {evaluation_results_str_cleaned}")
        return False
