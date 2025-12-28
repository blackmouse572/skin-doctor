# Introduction

Skin analysis wizards is a step-by-step guide for user to enter their skin information and get personalized skincare recommendations. The wizard typically includes questions about skin type, concerns, lifestyle, and preferences.

# Steps to Create a Skin Analysis Wizard

1. Upload Images
   - Allow users to upload images of their skin for analysis.
   - Provide guidelines on how to take clear and well-lit photos.
2. Skin concerns (Optional)
   - Ask users to select their primary skin concerns (e.g., acne, dryness, wrinkles).
   - Provide options for multiple selections.
3. Current Skincare Routine (Optional)
   - Inquire about the products users are currently using.
   - Ask for details such as product type, brand, and frequency of use.
   - Divide this step into multiple section for day and night routines.
4. Review
   - Summarize the information provided by the user.

# Flows

## Client Flow

1. User uploads images of their skin.
2. User fills out the skin concerns form
   2.1 If the user skips this step, proceed to step 3.
3. User fills out the current skincare routine form.
   3.1 If the user skips this step, proceed to step 4.
4. User reviews the summary of their inputs.
5. User submits the information for analysis.
6. If submission is successful, user can view the analysis results and chat with A.I for recommendations.

## Server Flow

1. Receive form-data including images and user inputs.
2. Validate the uploaded images and user inputs.
3. Store the images
4. Generate an analysis ID for tracking.
5. Process the skin concerns and current skincare routine data.
6. Generate a summary of the user's inputs.

## A.I Flow

- Analyze the uploaded images to assess skin condition.
- Check if the user has provided skin concerns and current skincare routine.
- If skin concerns are provided, analyze them to identify key issues.
- If current skincare routine is provided, evaluate the effectiveness of the products used.

## Contracts

### Client to Server

- Endpoint: POST /api/skin-analysis
- Require Authentication: Yes
- Request Body:

```json
{
  "images": [File],
  "symptoms": String, // Optional
  "description": String,
  "duration": String, // Optional
  "currentRoutine": String, // Optional
  "morningRoutine": String, // Optional
  "eveningRoutine": String // Optional
}
```

- Response Body:
```json
{
  "message": String,
  "data": {
    "analysisId": String,
    "summary": {
      "images": [String],
      "skin": {
        "healthPoint": Number, // 0-100
        "moistureLevel": Number, // 0-100
        "skinAge": Number,
        "skinType": String
      },
      "concerns": [
        {
          "type": String,
          "severity": String, // low, medium, high
          "description": String,
          "recommendations": [String],
          "points": Number // 0-100
        }
      ]
    }
  }
}
```

## TODO
[ ] Implement Image Upload Module using Cloudinary SDK
[ ] Design Chat UI for A.I Recommendations
[ ] Integrate A.I Analysis Service with Server
[ ] Test End-to-End Flow from Client to A.I Analysis
[ ] Improve Chat Experience with UI Components
