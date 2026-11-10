import json
import re
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parents[1] / 'work' / 'daily-source.json'
source = json.loads(SOURCE.read_text())
messages = [item for turn in source['turns'] for item in turn['items'] if 'Phrase 1:' in item.get('text', '')]
themes = ['small-talk', 'relationships', 'work', 'social', 'feelings', 'travel', 'slang', 'small-talk']
rows = '''Not up to much|I do not have much planned or happening.|Not up to much, just having a quiet afternoon.|A friend asks about your plans this afternoon. You have nothing special planned.|A colleague asks what you did over the weekend. It was very quiet.|I wasn't up to much, just relaxing at home.|Casual. Use it to describe your activities, not your ability.
Can't complain|Things are going reasonably well.|Can't complain. Work's been pretty good lately.|An old friend asks how life is going. Things are fine.|Your neighbour asks how your new job is going. It is going quite well.|Can't complain. Everyone's been really helpful.|An understated positive answer, not a literal rule about complaining.
Give me a shout|Contact me or let me know.|Give me a shout when you're free for coffee.|You want a friend to contact you when they have a free afternoon.|A teammate may need help later. Invite them to contact you.|Give me a shout if you need a hand.|Casual. It usually does not mean speaking loudly.
Have a soft spot for someone|Feel especially fond of someone, often despite their faults.|I've always had a soft spot for my old neighbour.|Tell a friend that you feel especially fond of your old neighbour.|You feel fond of the small café where you first worked. Explain that feeling.|I've got a soft spot for that little café.|Can also refer to places or things. It does not always mean romantic attraction.
Play hard to get|Act less interested than you are to make someone pursue you.|I think he's playing hard to get.|Your friend thinks their date is deliberately acting uninterested. Describe that behaviour.|Someone delays replying because they want to seem less eager. Describe the strategy.|She's playing hard to get by waiting before she replies.|Usually used in dating. Do not assume that a real lack of interest is a game.
Give someone butterflies|Make someone feel fluttery excitement or nervousness.|Seeing her still gives me butterflies.|Describe the excited, nervous feeling you get when you see someone you like.|You feel nervous excitement before going on stage. Describe how performing affects you.|Going on stage gives me butterflies.|Often romantic, but also used for anticipation and nervousness.
Get my point across|Communicate an idea so someone understands it.|I couldn't get my point across in the meeting.|You had a useful idea in a meeting but could not make people understand it.|You want your presentation to make one main idea clear. Explain your goal.|I want to get my main point across clearly.|Use get something across or get a point across. Get across something can have other meanings.
Touch base|Contact someone briefly to exchange news or check progress.|Let's touch base tomorrow about the proposal.|Arrange a brief progress check with a colleague tomorrow.|You want to contact a friend briefly after their first week in a new job.|I'll touch base with you on Friday and see how it's going.|Common in work conversations. Use touch base with someone about something.
Run something past someone|Tell someone an idea to get their opinion or approval.|Can I run an idea past you?|Ask a colleague if you can share an idea for their opinion.|Before booking a trip, you want your partner's view on the plan.|I'll run the plan past you before I book anything.|Run something by someone is also natural.
Tag along|Join someone else's trip or activity.|Mind if I tag along to the market?|Your friends are going to the market. Ask to join them.|Your flatmate is going for a walk. Ask whether you can come too.|Can I tag along on your walk?|Casual. It can suggest joining plans that were already made.
Bail on someone|Cancel or leave plans involving someone, often at short notice.|Sorry I bailed on you last night.|Apologise for cancelling dinner with your friend at the last minute.|A friend cancels your weekend plans again. Explain why you are disappointed.|I'm disappointed that you bailed on me again.|Casual. Bail can also have legal meanings, which are different.
Suss something out|Investigate or understand something by checking it.|I'll suss out the parking before we go.|You want to check the parking situation before a visit.|You are trying to understand how a new booking system works.|I'm still sussing out how the booking system works.|Informal, common in Australian and British English.
Rub someone the wrong way|Annoy someone, often because of your manner or attitude.|His dismissive tone rubbed me the wrong way.|A colleague's dismissive tone annoyed you. Explain how it affected you.|Your joke annoyed a friend even though you meant no harm.|I think my joke rubbed her the wrong way.|American English often uses rub someone the wrong way; British English also uses rub someone up the wrong way.
Have a short fuse|Become angry very easily or quickly.|I've had a short fuse lately because I'm exhausted.|You have been getting angry quickly because you are exhausted. Explain it.|A character in a film gets angry at the smallest problem. Describe them.|That character has a very short fuse.|It describes a tendency to anger, not a single calm disagreement.
Take something in your stride|Deal calmly with a difficulty or surprise.|She took the last-minute change in her stride.|Praise a colleague who stayed calm when the plan changed suddenly.|You had a travel delay but handled it without much stress.|I took the delay in my stride and found somewhere to read.|In American English, take something in stride is also common.
Have a squiz|Have a quick look.|Let's have a squiz at the menu.|Ask a friend to take a quick look at a café menu with you.|A friend has a new camera. Ask to have a look at it.|Can I have a squiz at your new camera?|Very informal Australian and New Zealand English. Squiz rhymes with quiz.
Set you back|Cost you an amount of money.|That jacket will set you back about two hundred dollars.|Tell a friend that a jacket costs about two hundred dollars.|Someone asks how much your weekend trip cost.|The trip set me back about four hundred dollars.|Informal when discussing cost. Set someone back can also mean delay their progress.
Hit the spot|Be exactly what you wanted or needed, especially food or drink.|That cold drink really hit the spot.|You have a cold drink after a long walk. Say how satisfying it is.|You enjoy a bowl of soup on a cold evening.|That soup really hit the spot.|Usually expresses satisfaction or relief, not a physical hit.
Take the piss|Make fun of someone, or behave unreasonably.|Are you taking the piss, or are you serious?|A mate makes a ridiculous claim. Ask if they are joking.|A friend keeps teasing you about your terrible singing. Describe it.|He's taking the piss out of my singing.|Very informal and mildly vulgar. Use with people who are comfortable with it.
Give someone stick|Tease or criticise someone.|My mates gave me stick for missing the goal.|Your friends tease you because you missed an easy goal. Describe what happened.|A teammate arrived late and everyone teased them about it.|We gave him a bit of stick for being late.|Informal British and Australian English. Tone decides whether it feels playful or harsh.
Have a laugh|Enjoy a funny or pleasant time together; sometimes mean to joke.|We had a laugh over lunch.|Tell a friend that lunch with your colleagues was funny and enjoyable.|Someone asks an absurd price. In casual British English, question whether they are serious.|You're having a laugh if you think I'll pay that much.|Having a laugh can mean joking. Are you having a laugh? can express disbelief.
Been flat out|Have been extremely busy.|I've been flat out with work this week.|A friend asks why they have not seen you lately. Work has been extremely busy.|You have been very busy preparing for a move. Explain why you missed a message.|Sorry, I've been flat out getting ready to move.|Common in Australian English. Flat out can also mean at maximum speed.
Can't go wrong with ...|Something is a reliable or safe choice.|You can't go wrong with a good Thai place.|Recommend Thai food as a reliable dinner choice.|Your friend needs a simple picnic snack. Recommend fresh fruit.|You can't go wrong with fresh fruit for a picnic.|An enthusiastic recommendation, not a literal guarantee.
I'm easy|I am happy with any of the options.|I'm easy. Coffee or lunch both sound good.|A friend asks whether you prefer coffee or lunch. You are happy with either.|Your friends ask whether to meet on Saturday or Sunday. Both suit you.|I'm easy. Either day works for me.|Casual, common in Australia and Britain. Use a clear choice context to avoid unintended meanings.'''

phrases, lessons = [], []
for index, line in enumerate(rows.splitlines()):
    expression, meaning, example, prompt, transfer, transfer_sample, note = line.split('|')
    day = index // 3
    phrase_id = re.sub(r'[^a-z0-9]+', '-', expression.lower()).strip('-')
    lesson_date = str(date(2026, 11, 2) + timedelta(days=day))
    phrases.append({
        'id': phrase_id, 'expression': expression, 'meaning': meaning, 'example': example,
        'pronunciation': 'Listen once, then try saying the whole phrase in one smooth chunk.',
        'register': 'Very informal' if day == 6 else 'Informal' if day in [0, 3, 5, 7] else 'Conversational',
        'note': note, 'theme': themes[day], 'source': 'daily', 'sourceDate': lesson_date,
        'sourceMessageId': messages[day]['id'],
        'scenarios': [
            {'setting': 'First encounter', 'prompt': prompt, 'sample': example},
            {'setting': 'A new situation', 'prompt': transfer, 'sample': transfer_sample},
        ],
    })
for day in range(8):
    lessons.append({'date': str(date(2026, 11, 2) + timedelta(days=day)), 'theme': themes[day],
                    'phraseIds': [p['id'] for p in phrases[day*3:day*3+3]], 'origin': 'conversation'})
(ROOT / 'src/data/daily.json').write_text(json.dumps({'phrases': phrases, 'lessons': lessons}, indent=2) + '\n')
print(f'Wrote {len(phrases)} phrases in {len(lessons)} lessons.')
