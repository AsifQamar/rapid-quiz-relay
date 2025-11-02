import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock, Trophy, Loader2 } from "lucide-react";

const PlayQuiz = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participant');
  const { toast } = useToast();
  
  const [session, setSession] = useState<any>({
    status: "waiting",
    show_leaderboard: false
  });
  const [currentQuestion, setCurrentQuestion] = useState<any>({
    question_text: "Sample Question",
    option_a: "Option A",
    option_b: "Option B",
    option_c: "Option C",
    option_d: "Option D",
    time_limit: 30
  });
  const [participant, setParticipant] = useState<any>({
    name: "Player",
    score: 0
  });
  const [participants, setParticipants] = useState<any[]>([
    { id: 1, name: "Player 1", score: 100 },
    { id: 2, name: "Player 2", score: 50 }
  ]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    // TODO: Replace with your backend WebSocket/SSE connection
    // const ws = new WebSocket(`ws://your-backend/sessions/${sessionId}?participant=${participantId}`);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   setSession(data.session);
    //   setCurrentQuestion(data.currentQuestion);
    //   setTimeLeft(data.timeLeft);
    //   setParticipants(data.participants);
    // };
  }, [sessionId, participantId]);

  useEffect(() => {
    if (timeLeft > 0 && session?.status === 'active' && !hasAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, session?.status, hasAnswered]);

  const submitAnswer = async (answer: string) => {
    if (hasAnswered || !currentQuestion) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);

    try {
      // TODO: Replace with your backend API call
      // await fetch('/api/answers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     participantId, 
      //     questionId: currentQuestion.id, 
      //     answer,
      //     timeTaken: currentQuestion.time_limit - timeLeft 
      //   })
      // });
      
      toast({ title: "Answer submitted!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getAnswerColor = (option: string) => {
    const colors = {
      A: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      B: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      C: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      D: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    };
    return colors[option as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/10 p-4">
      <div className="container max-w-4xl mx-auto">
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Welcome,</p>
              <p className="text-xl font-bold">{participant?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className="text-2xl font-bold text-primary">{participant?.score || 0}</p>
            </div>
          </div>
        </Card>

        {session.status === 'waiting' && (
          <Card className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Get Ready!</h2>
            <p className="text-xl text-muted-foreground">
              Waiting for the host to start the quiz...
            </p>
          </Card>
        )}

        {session.status === 'active' && !session.show_leaderboard && currentQuestion && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Answer the question</h3>
              <div className="flex items-center gap-2 text-warning">
                <Clock className="h-5 w-5" />
                <span className="text-xl font-bold">{timeLeft}s</span>
              </div>
            </div>

            <div className="p-6 bg-muted rounded-lg mb-6">
              <p className="text-xl font-semibold mb-4">{currentQuestion.question_text}</p>
              {currentQuestion.question_image_url && (
                <img 
                  src={currentQuestion.question_image_url} 
                  alt="Question" 
                  className="w-full max-h-64 object-contain rounded-lg"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map(option => {
                const optionText = currentQuestion[`option_${option.toLowerCase()}`];
                if (!optionText) return null;
                
                return (
                  <Button
                    key={option}
                    onClick={() => submitAnswer(option)}
                    disabled={hasAnswered || timeLeft === 0}
                    className={`h-auto py-6 px-6 text-left justify-start bg-gradient-to-br ${getAnswerColor(option)} text-white disabled:opacity-50 ${
                      selectedAnswer === option ? 'ring-4 ring-white' : ''
                    }`}
                  >
                    <span className="text-2xl font-bold mr-3">{option}</span>
                    <span className="text-lg">{optionText}</span>
                  </Button>
                );
              })}
            </div>

            {hasAnswered && (
              <p className="text-center mt-6 text-lg font-semibold text-success">
                Answer submitted! Wait for the next question...
              </p>
            )}
          </Card>
        )}

        {session.status === 'active' && session.show_leaderboard && (
          <Card className="p-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-warning" />
            <h2 className="text-3xl font-bold mb-8">Current Standings</h2>
            
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div 
                  key={p.id}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    p.id === participantId ? 'bg-primary/20 border-2 border-primary' :
                    i === 0 ? 'bg-warning/20 border-2 border-warning' :
                    'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{i + 1}</span>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <span className="text-xl font-bold text-primary">{p.score}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {session.status === 'finished' && (
          <Card className="p-12 text-center">
            <Trophy className="h-20 w-20 mx-auto mb-4 text-warning" />
            <h2 className="text-4xl font-bold mb-4">Quiz Finished!</h2>
            <p className="text-2xl mb-8">Your final score: <span className="font-bold text-primary">{participant?.score || 0}</span></p>
            
            <h3 className="text-2xl font-bold mb-4">Final Rankings</h3>
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div 
                  key={p.id}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    p.id === participantId ? 'bg-primary/20 border-2 border-primary' :
                    i === 0 ? 'bg-warning/20 border-2 border-warning' :
                    'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{i + 1}</span>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <span className="text-xl font-bold text-primary">{p.score}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlayQuiz;
