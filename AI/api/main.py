import argparse
import os
from file_processor import FileProcessor
from vector_store import VectorStore
from chatbot import CourseChatbot

def main():
    parser = argparse.ArgumentParser(description="RAG-based Course Chatbot")
    parser.add_argument("--upload", type=str, help="Path to a file or directory to upload.")
    parser.add_argument("--query", type=str, help="The question to ask the chatbot.")
    parser.add_argument("--reset", action="store_true", help="Reset the vector database.")
    
    args = parser.parse_args()

    processor = FileProcessor()
    vstore = VectorStore()
    bot = CourseChatbot(vstore)

    if args.reset:
        vstore.clear_database()

    if args.upload:
        print(f" Uploading and processing: {args.upload}")
        if os.path.isdir(args.upload):
            docs = processor.load_directory(args.upload)
        elif args.upload.lower().endswith(".pdf"):
            docs = processor.load_pdf(args.upload)
        elif args.upload.lower().endswith((".pptx", ".ppt")):
            docs = processor.load_ppt(args.upload)
        elif args.upload.lower().endswith((".txt", ".md")):
            docs = processor.load_txt(args.upload)
        else:
            print(f" Unsupported file type: {args.upload}")
            return

        chunks = processor.split_documents(docs)
        vstore.add_documents(chunks)
        print(" Processing complete.")

    if args.query:
        print(f" Question: {args.query}")
        response, sources = bot.get_response(args.query)
        print(f"\n Response: {response}")
        print(f"\n Sources: {sources}")

    if not args.upload and not args.query and not args.reset:
        # Interactive mode
        print(" Welcome to the Course Chatbot! (Type 'exit' to quit)")
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ["exit", "quit"]:
                break
            if user_input.lower() == "clear":
                bot.clear_history()
                print(" Chat history cleared.")
                continue
                
            response, sources = bot.get_response(user_input)
            print(f"\n Bot: {response}")
            print(f"\n(Sources: {sources})")

if __name__ == "__main__":
    main()
