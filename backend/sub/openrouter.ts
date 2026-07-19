import { OpenRouter } from '@openrouter/sdk';
import { openrouterApiKey } from './lib';
import { queryDecompositionPrompt, systemPrompt } from './prompts';

const openrouter = new OpenRouter({
    apiKey: openrouterApiKey,
    //   httpReferer: '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    //   appTitle: '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
});


export const mainChat = async (query: string) => {
    const completion = await openrouter.chat.send({
        chatRequest: {

            model: 'openrouter/free',
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: query,
                },
            ],
        },
    });

    return completion;
}

export const queryDecompositionChat = async (query: string) => {
    const completion = await openrouter.chat.send({
        chatRequest: {

            model: 'openrouter/free',
            messages: [
                {
                    role: "system",
                    content: queryDecompositionPrompt
                },
                {
                    role: 'user',
                    content: query,
                },
            ],
        },
    });

    return completion;
}



// let response = "";
// for await (const chunk of stream) {
//   const content = chunk.choices[0]?.delta?.content;
//   if (content) {
//     response += content;
//     process.stdout.write(content);
//   }

//   // Usage information comes in the final chunk
//   if (chunk.usage) {
//     console.log("\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
//   }
// }
