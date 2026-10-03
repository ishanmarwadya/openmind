/* OpenMind prototype: all learning content lives here so it can be edited without touching app logic.
   Each topic is a short Socratic script: a hook question, steps that each expect an idea from the child,
   an explain-back prompt, the concepts we check for, and a spaced-review question. */

window.OM_CONTENT = (() => {
  const t = (en, hi) => ({ en, hi: hi || en });

  const TOPICS = [
    {
      id: 'sky', title: t('Why is the sky blue?', 'Aasmaan neela kyun hai?'), subject: 'Science', classes: [3, 4, 5], icon: '🌤️',
      match: ['sky', 'blue', 'aasmaan', 'asman', 'aasman', 'neela', 'nila'],
      hook: t("Ooh, I love this one! Before I tell you anything, what colour is the sky in the evening, when the sun is setting?",
        "Accha sawaal! Pehle tum batao, shaam ko aasmaan kis rang ka dikhta hai?"),
      steps: [
        { expect: ['orange', 'red', 'pink', 'yellow', 'golden', 'laal', 'lal', 'narangi', 'peela', 'gulabi', 'sunehra'],
          praise: t("Yes! Orange and red. So the sky's colour changes during the day. Could that have something to do with sunlight?",
            "Bilkul! Toh rang badal raha hai. Kya yeh sooraj ki roshni se juda ho sakta hai?"),
          hint: t("Think about sunsets. Have you ever seen the sky look orange or pink?", "Sunset yaad karo. Kya aasmaan kabhi orange ya gulabi dikhta hai?") },
        { expect: ['yes', 'haan', 'ha', 'han', 'sun', 'sooraj', 'suraj', 'light', 'roshni', 'maybe', 'shayad'],
          praise: t("Exactly. Sunlight looks white, but it's really all the colours of the rainbow mixed together. When it hits the air, the blue part bounces around the most. So where do you think all that bouncing blue light goes?",
            "Ekdum sahi. Sooraj ki safed roshni mein saare rang chhupe hote hain. Hawa se takra kar neela rang sabse zyada bikharta hai. Toh woh bikhra hua neela rang kahan jaata hoga?"),
          hint: t("Here's a clue: the sky changes colour when the sun moves. What could be the reason?", "Ek clue: sooraj ke saath aasmaan ka rang badalta hai. Kya wajah ho sakti hai?") },
        { expect: ['everywhere', 'all over', 'sky', 'aasmaan', 'eye', 'aankh', 'har jagah', 'chaaron', 'spread', 'fail', 'around', 'us'],
          praise: t("Yes! It spreads all over the sky and into our eyes, so the whole sky looks blue to us.",
            "Haan! Woh poore aasmaan mein fail jaata hai aur hamari aankhon tak aata hai. Isliye aasmaan neela dikhta hai."),
          hint: t("Imagine throwing blue glitter in a room. Where does it end up?", "Socho, kamre mein neela glitter uchhal do. Woh kahan kahan jaayega?") }
      ],
      explain: t("Now you be the teacher. Explain to me why the sky is blue, in your own words.", "Ab tum teacher bano. Apne shabdon mein samjhao, aasmaan neela kyun hai?"),
      concepts: [
        { name: t('sunlight has many colours', 'roshni mein kai rang'), kw: ['colour', 'color', 'colours', 'rang', 'rainbow', 'white', 'safed', 'mix'] },
        { name: t('air scatters blue light', 'hawa neela rang bikherti hai'), kw: ['air', 'hawa', 'bounce', 'scatter', 'bikhar', 'spread', 'fail'] },
        { name: t('blue light reaches our eyes', 'neela rang aankhon tak aata hai'), kw: ['eye', 'aankh', 'see', 'dikh', 'everywhere', 'har jagah'] }
      ],
      review: { q: t('Quick one: why does the sky look blue?', 'Jaldi batao: aasmaan neela kyun dikhta hai?'), kw: ['air', 'hawa', 'scatter', 'bikhar', 'bounce', 'sunlight', 'roshni', 'spread'] }
    },
    {
      id: 'plants', title: t('How do plants make food?', 'Paudhe khana kaise banate hain?'), subject: 'Science', classes: [4, 5], icon: '🌱',
      match: ['plant', 'plants', 'leaf', 'leaves', 'photosynthesis', 'paudha', 'patti', 'patte', 'tree food'],
      hook: t("Plants never go to the kitchen, but they still eat! What do you think a plant needs to stay alive?", "Paudhe kitchen nahi jaate, phir bhi khaate hain! Tumhe kya lagta hai, paudhe ko zinda rehne ke liye kya chahiye?"),
      steps: [
        { expect: ['water', 'sun', 'sunlight', 'light', 'soil', 'air', 'paani', 'mitti', 'hawa', 'dhoop'],
          praise: t("Great thinking! Water, sunlight and air are the big three. Now, which part of the plant do you think catches the sunlight?", "Bahut badhiya! Paani, dhoop aur hawa. Ab batao, paudhe ka kaunsa hissa dhoop pakadta hai?"),
          hint: t("Think about what you give a plant every morning, and where we keep plants.", "Socho, paudhe ko roz kya dete hain, aur paudhe kahan rakhte hain?") },
        { expect: ['leaf', 'leaves', 'patti', 'patte', 'green'],
          praise: t("Yes, the leaves! Leaves are like tiny green kitchens. They mix sunlight, water and a gas from the air to make sugar. Why do you think most leaves are green?", "Haan, patte! Patte chhoti hari kitchen jaise hain. Woh dhoop, paani aur hawa ki gas se meetha khana banate hain. Patte hare kyun hote hain?"),
          hint: t("It's the flat green part. What do we call it?", "Woh chapti hari cheez. Usse kya kehte hain?") },
        { expect: ['chlorophyll', 'green', 'colour', 'color', 'sunlight', 'catch', 'hara', 'rang'],
          praise: t("Nice! Leaves have a green helper called chlorophyll that catches sunlight. That's how plants make their own food. Scientists call it photosynthesis.", "Shabaash! Patton mein chlorophyll naam ka hara helper hota hai jo dhoop pakadta hai. Isse photosynthesis kehte hain."),
          hint: t("The green colour has a job. What could it help the leaf catch?", "Hara rang ka ek kaam hai. Woh patti ko kya pakadne mein madad karta hoga?") }
      ],
      explain: t("Your turn to teach me. How does a plant make its food?", "Ab tum samjhao. Paudha apna khana kaise banata hai?"),
      concepts: [
        { name: t('needs sunlight, water and air'), kw: ['sun', 'sunlight', 'light', 'water', 'air', 'dhoop', 'paani', 'hawa'] },
        { name: t('food is made in the leaves'), kw: ['leaf', 'leaves', 'patti', 'patte'] },
        { name: t('chlorophyll catches sunlight'), kw: ['chlorophyll', 'green', 'hara'] }
      ],
      review: { q: t('Where in a plant is food made, and what does it need?'), kw: ['leaf', 'leaves', 'sunlight', 'water', 'air', 'patti'] }
    },
    {
      id: 'rain', title: t('Where does rain come from?', 'Baarish kahan se aati hai?'), subject: 'EVS', classes: [3, 4, 5], icon: '🌧️',
      match: ['rain', 'raining', 'cloud', 'clouds', 'water cycle', 'baarish', 'barish', 'baadal', 'badal'],
      hook: t("Let's be detectives. When you leave a wet towel in the sun, what happens to the water?", "Chalo detective bante hain. Geela towel dhoop mein rakho toh paani ka kya hota hai?"),
      steps: [
        { expect: ['dry', 'disappear', 'evaporat', 'air', 'gone', 'sukh', 'udd', 'vapour', 'vapor', 'steam'],
          praise: t("Yes! The water turns into invisible vapour and floats up. That's called evaporation. Where do you think it goes, way up high?", "Haan! Paani bhaap ban kar upar udd jaata hai. Ise evaporation kehte hain. Upar jaakar kahan jaata hoga?"),
          hint: t("Does the towel stay wet forever? Where could the water go?", "Kya towel hamesha geela rehta hai? Paani kahan gaya?") },
        { expect: ['cloud', 'sky', 'up', 'badal', 'baadal', 'aasmaan', 'cold'],
          praise: t("Right, up to the sky where it's cold. The vapour cools down and becomes tiny drops that make clouds. What happens when a cloud gets too full of drops?", "Sahi! Upar thand mein bhaap chhoti boondein banti hai, aur badal bante hain. Jab badal boondon se bhar jaata hai toh kya hota hai?"),
          hint: t("Look up on a rainy day. What do you see?", "Baarish ke din upar dekho. Kya dikhta hai?") },
        { expect: ['rain', 'fall', 'drop', 'baarish', 'barish', 'gir', 'heavy'],
          praise: t("Exactly! The drops get heavy and fall as rain. Then the water flows to rivers and seas, and the whole cycle starts again. That's the water cycle!", "Bilkul! Boondein bhaari hokar baarish ban jaati hain. Phir paani nadiyon mein jaata hai aur chakra phir shuru. Yahi water cycle hai!"),
          hint: t("If you fill a bucket too much, what happens?", "Balti zyada bhar do toh kya hota hai?") }
      ],
      explain: t("Explain the water cycle to me like I'm your little cousin.", "Mujhe water cycle aise samjhao jaise main tumhara chhota cousin hoon."),
      concepts: [
        { name: t('water evaporates in the sun'), kw: ['evaporat', 'vapour', 'vapor', 'steam', 'bhaap', 'sun', 'heat', 'dry'] },
        { name: t('vapour cools into clouds'), kw: ['cloud', 'badal', 'baadal', 'cool', 'cold', 'thand'] },
        { name: t('heavy drops fall as rain'), kw: ['rain', 'fall', 'drop', 'baarish', 'heavy', 'gir'] }
      ],
      review: { q: t('Tell me the three steps of the water cycle.'), kw: ['evaporat', 'cloud', 'rain', 'vapour', 'fall'] }
    },
    {
      id: 'moon', title: t('Why does the moon change shape?', 'Chand ka aakaar kyun badalta hai?'), subject: 'Science', classes: [4, 5], icon: '🌙',
      match: ['moon', 'chand', 'chaand', 'full moon', 'half moon', 'amavasya', 'purnima'],
      hook: t("Here's a mystery! Does the moon make its own light, like a bulb, or does it borrow light from somewhere?", "Ek rahasya! Kya chand khud roshni banata hai, bulb jaisa, ya kahin se udhaar leta hai?"),
      steps: [
        { expect: ['borrow', 'sun', 'sooraj', 'reflect', 'udhaar', 'not', 'nahi'],
          praise: t("Smart! The moon shines because sunlight bounces off it. Now, the moon travels around the Earth. Do we always see the same side lit up?", "Smart! Chand sooraj ki roshni se chamakta hai. Chand dharti ke chakkar lagata hai. Kya hamesha poora roshan hissa dikhta hai?"),
          hint: t("At night, where is the sun? Could its light still reach the moon?", "Raat ko sooraj kahan hota hai? Kya uski roshni chand tak pahunchti hogi?") },
        { expect: ['no', 'nahi', 'different', 'part', 'half', 'changes', 'not always'],
          praise: t("Yes! As the moon moves, we see different amounts of its sunny side. That's why it looks full, half, or like a thin smile. These are called phases.", "Haan! Chand ke ghoomne se uska roshan hissa kam-zyada dikhta hai. Isliye kabhi poora, kabhi aadha. Inhe phases kehte hain."),
          hint: t("Shine a torch on a ball and walk around it. Does the lit part look the same from everywhere?", "Ball par torch maaro aur ghoomo. Kya roshan hissa har taraf se ek jaisa dikhta hai?") }
      ],
      explain: t("Teach me: why does the moon look different on different nights?"),
      concepts: [
        { name: t('the moon reflects sunlight'), kw: ['sun', 'sooraj', 'reflect', 'borrow', 'light', 'roshni'] },
        { name: t('the moon moves around the Earth'), kw: ['around', 'earth', 'dharti', 'move', 'travel', 'ghoom', 'orbit'] },
        { name: t('we see different lit parts'), kw: ['part', 'half', 'side', 'phase', 'different', 'hissa'] }
      ],
      review: { q: t('Why does the moon look like a half circle sometimes?'), kw: ['sun', 'part', 'side', 'phase', 'around', 'reflect'] }
    },
    {
      id: 'float', title: t('Why do some things float?', 'Kuch cheezein tairti kyun hain?'), subject: 'Science', classes: [3, 4, 5], icon: '🛶',
      match: ['float', 'sink', 'boat', 'tair', 'doob', 'ship', 'naav'],
      hook: t("Quick experiment in your head: a small coin and a big wooden log go into a bucket of water. Which one sinks?", "Dimaag mein experiment: ek chhota sikka aur ek bada lakdi ka lattha paani mein. Kaun doobega?"),
      steps: [
        { expect: ['coin', 'sikka', 'metal'],
          praise: t("Yes, the coin! Surprising, right? The big log floats. So is it about how big something is, or something else?", "Haan, sikka! Hairani hui na? Bada lattha tairta hai. Toh kya baat size ki hai, ya kuch aur?"),
          hint: t("Have you seen big ships float? And a tiny stone sink?", "Bade jahaz tairte dekhe hain? Aur chhota patthar doobta hai?") },
        { expect: ['heavy', 'weight', 'material', 'air', 'something else', 'kuch aur', 'bhaari', 'hollow', 'dense', 'wood', 'lakdi'],
          praise: t("Great idea! It's about how tightly packed the stuff is, compared to water. Wood and things full of air are loose, so they float. Metal is packed tight, so a coin sinks. Then how does a giant iron ship float?", "Badhiya! Baat yeh hai ki cheez kitni ghani bhari hai. Lakdi aur hawa wali cheezein tairti hain. Toh lohe ka jahaz kaise tairta hai?"),
          hint: t("Think: what's inside a ball that helps it float?", "Socho: ball ke andar kya hai jo use tairne deta hai?") },
        { expect: ['air', 'hollow', 'shape', 'hawa', 'khali', 'empty', 'wide'],
          praise: t("Brilliant! A ship is shaped like a huge bowl full of air, so overall it's lighter than the water it pushes away. Shape matters!", "Kamaal! Jahaz ek bade katore jaisa hai jismein hawa bhari hai. Shape bhi zaroori hai!"),
          hint: t("A steel bowl floats but a steel spoon sinks. What's different?", "Steel ka katora tairta hai, chammach doobti hai. Kya fark hai?") }
      ],
      explain: t("Now teach me: why does a heavy ship float but a coin sinks?"),
      concepts: [
        { name: t('not about size alone'), kw: ['size', 'big', 'small', 'not', 'nahi'] },
        { name: t('how packed the material is'), kw: ['packed', 'dense', 'material', 'wood', 'metal', 'heavy', 'light'] },
        { name: t('shape and air inside help'), kw: ['air', 'hollow', 'shape', 'bowl', 'hawa', 'empty'] }
      ],
      review: { q: t('Why does a huge ship float?'), kw: ['air', 'hollow', 'shape', 'bowl', 'hawa'] }
    },
    {
      id: 'fractions', title: t('What is a fraction?', 'Fraction kya hota hai?'), subject: 'Maths', classes: [3, 4, 5], icon: '🍕',
      match: ['fraction', 'fractions', 'half', 'quarter', 'bhinn', 'aadha', 'pizza'],
      hook: t("You and your best friend share one roti equally. How much does each of you get?", "Tum aur tumhara dost ek roti barabar baantte ho. Har ek ko kitna milega?"),
      steps: [
        { expect: ['half', 'aadha', '1/2', 'one half', 'half half', 'equal'],
          praise: t("Half! We write it as 1 over 2. The bottom number says how many equal parts, the top says how many you take. If four friends share a pizza, what does each one get?", "Aadha! Ise 1 by 2 likhte hain. Neeche wala number batata hai kitne barabar hisse, upar wala kitne liye. Chaar dost pizza baantein toh har ek ko?"),
          hint: t("If you cut the roti into 2 equal pieces, how many pieces is yours?", "Roti ke 2 barabar tukde karo, tumhara kitna?") },
        { expect: ['quarter', '1/4', 'one fourth', 'one quarter', 'fourth', 'chautha', 'paav'],
          praise: t("Yes, one quarter, 1 over 4! Now a tricky one: would you rather have 1/2 or 1/4 of a chocolate bar?", "Haan, 1 by 4! Ab mushkil wala: chocolate ka 1/2 loge ya 1/4?"),
          hint: t("Four equal pieces, you get one. How do we write that?", "Chaar barabar tukde, tumhe ek. Kaise likhenge?") },
        { expect: ['1/2', 'half', 'aadha', 'bigger', 'more', 'zyada', 'two'],
          praise: t("Smart choice! Fewer pieces means each piece is bigger, so 1/2 is more than 1/4. A bigger bottom number means smaller slices!", "Smart! Kam hisse matlab bada tukda. Isliye 1/2, 1/4 se zyada hai!"),
          hint: t("Picture the chocolate cut in 2 pieces, and another cut in 4. Which piece is bigger?", "Socho ek chocolate 2 tukde, doosri 4 tukde. Kaunsa tukda bada?") }
      ],
      explain: t("Teach me what the top and bottom numbers in a fraction mean."),
      concepts: [
        { name: t('equal parts'), kw: ['equal', 'barabar', 'same', 'parts', 'pieces', 'hisse'] },
        { name: t('bottom number = total parts'), kw: ['bottom', 'below', 'neeche', 'total', 'how many parts', 'denominator'] },
        { name: t('top number = parts taken'), kw: ['top', 'upar', 'take', 'taken', 'numerator', 'how many you'] }
      ],
      review: { q: t('Which is bigger, 1/3 or 1/5? Why?'), kw: ['1/3', 'third', 'fewer', 'bigger', 'less parts', 'kam'] }
    },
    {
      id: 'shadows', title: t('How are shadows made?', 'Parchhai kaise banti hai?'), subject: 'Science', classes: [3, 4, 5], icon: '🔦',
      match: ['shadow', 'shadows', 'parchhai', 'parchai', 'chhaya'],
      hook: t("Go stand in the sun in your mind. Where does your shadow fall, towards the sun or away from it?", "Socho tum dhoop mein khade ho. Tumhari parchhai kahan girti hai, sooraj ki taraf ya ulti taraf?"),
      steps: [
        { expect: ['away', 'opposite', 'behind', 'ulti', 'peeche', 'other side'],
          praise: t("Yes, away from the sun. Light travels in straight lines, and your body blocks it. What does that blocked spot look like?", "Haan, ulti taraf. Roshni seedhi chalti hai, aur tumhara shareer use rokta hai. Woh ruki hui jagah kaisi dikhti hai?"),
          hint: t("If the sun is in front of you, where is your shadow?", "Sooraj saamne ho toh parchhai kahan?") },
        { expect: ['dark', 'shadow', 'black', 'andhera', 'kaala', 'shape'],
          praise: t("Right, a dark shape, that's your shadow! Now: why is your shadow really long in the evening but short at lunchtime?", "Sahi, ek kaali shape! Ab batao, shaam ko parchhai lambi aur dopahar ko chhoti kyun?"),
          hint: t("What's missing in that spot behind you?", "Tumhare peeche us jagah kya nahi pahunchta?") },
        { expect: ['low', 'high', 'angle', 'position', 'sun', 'neeche', 'upar', 'slant', 'tircha'],
          praise: t("Brilliant! When the sun is low, light comes in at a slant and stretches the shadow. At noon the sun is high overhead, so the shadow is short.", "Shaandaar! Sooraj neeche ho toh roshni tirchi aati hai, parchhai lambi. Dopahar ko sooraj upar, parchhai chhoti."),
          hint: t("Where is the sun in the sky in the evening, low or high?", "Shaam ko sooraj aasmaan mein neeche hota hai ya upar?") }
      ],
      explain: t("Explain to me how a shadow is made and why it changes length."),
      concepts: [
        { name: t('light travels in straight lines'), kw: ['straight', 'line', 'seedhi', 'travel'] },
        { name: t('an object blocks light'), kw: ['block', 'stop', 'rok', 'body', 'object'] },
        { name: t('sun position changes length'), kw: ['low', 'high', 'angle', 'evening', 'noon', 'position', 'neeche', 'upar'] }
      ],
      review: { q: t('Why is your shadow longest in the evening?'), kw: ['low', 'angle', 'slant', 'sun', 'neeche'] }
    },
    {
      id: 'food', title: t('Why do we eat different foods?', 'Alag alag khana kyun khaate hain?'), subject: 'EVS', classes: [3, 4], icon: '🥗',
      match: ['food', 'eat', 'healthy', 'diet', 'khana', 'protein', 'vitamin', 'junk'],
      hook: t("Imagine eating only chips for a whole week. How do you think your body would feel?", "Socho, poore hafte sirf chips khao. Tumhara shareer kaisa mehsoos karega?"),
      steps: [
        { expect: ['bad', 'tired', 'sick', 'weak', 'unhealthy', 'kharab', 'thaka', 'bimar', 'not good', 'stomach'],
          praise: t("Right, tired and not great. Different foods do different jobs. Dal, eggs and paneer build muscles. Which food do you think gives us quick energy to run?", "Sahi! Har khane ka alag kaam hai. Dal, anda, paneer muscles banate hain. Daudne ki taakat kis khane se milti hai?"),
          hint: t("Would you have energy to play cricket after only chips?", "Sirf chips khaakar cricket khelne ki taakat hogi?") },
        { expect: ['rice', 'roti', 'chawal', 'bread', 'banana', 'kela', 'potato', 'aloo', 'sugar', 'carb'],
          praise: t("Yes! Roti, rice and bananas are energy foods. And fruits and vegetables have vitamins that keep us from falling sick. So why should a thali have many colours?", "Haan! Roti, chawal, kela energy dete hain. Phal aur sabziyon mein vitamins hote hain. Toh thali mein kai rang kyun hone chahiye?"),
          hint: t("What do you eat before a big match or exam?", "Bade match se pehle kya khaate ho?") },
        { expect: ['different', 'all', 'vitamin', 'healthy', 'balance', 'many', 'alag', 'sab'],
          praise: t("Exactly! A colourful thali gives your body every kind of helper it needs. That's called a balanced diet.", "Bilkul! Rangeen thali shareer ko har tarah ki madad deti hai. Ise balanced diet kehte hain."),
          hint: t("Each colour brings a different helper. What happens if one is missing?", "Har rang ek alag helper laata hai. Ek na ho toh?") }
      ],
      explain: t("Teach me why a balanced diet matters."),
      concepts: [
        { name: t('body-building foods'), kw: ['dal', 'egg', 'anda', 'paneer', 'protein', 'muscle'] },
        { name: t('energy foods'), kw: ['energy', 'rice', 'roti', 'chawal', 'banana', 'taakat'] },
        { name: t('protective foods'), kw: ['vitamin', 'fruit', 'vegetable', 'sabzi', 'phal', 'sick', 'protect'] }
      ],
      review: { q: t('Name one energy food and one body-building food.'), kw: ['rice', 'roti', 'dal', 'egg', 'paneer', 'banana', 'chawal'] }
    },
    {
      id: 'nouns', title: t('What are naming words?', 'Naming words kya hain?'), subject: 'English', classes: [3, 4], icon: '🔤',
      match: ['noun', 'nouns', 'naming word', 'naming words', 'sangya'],
      hook: t("Look around you right now. Tell me the names of three things you can see.", "Abhi apne aas-paas dekho. Teen cheezon ke naam batao jo dikh rahi hain."),
      steps: [
        { expect: ['*'],
          praise: t("Lovely! Every word you just said is a noun, a naming word. Names of people are nouns too. What's the name of your best friend?", "Wah! Tumne jo bhi naam bole woh sab nouns hain. Logon ke naam bhi nouns hote hain. Tumhare best friend ka naam?"),
          hint: t("Anything you can see: a fan, a book, a window...", "Jo bhi dikhe: pankha, kitaab, khidki...") },
        { expect: ['*'],
          praise: t("Great, that's a noun too! Places are nouns as well. Is 'run' a noun, or is it a doing word?", "Badhiya, yeh bhi noun hai! Jagah ke naam bhi nouns. Kya 'run' noun hai, ya kaam karne wala word?"),
          hint: t("Just type your friend's name.") },
        { expect: ['doing', 'action', 'verb', 'not', 'no', 'nahi', 'kaam'],
          praise: t("Yes! 'Run' is a doing word, a verb. Nouns name people, places and things.", "Haan! 'Run' doing word hai, verb. Nouns logon, jagahon aur cheezon ke naam hain."),
          hint: t("Can you touch a 'run'? Or is it something you do?", "Kya 'run' ko chhoo sakte ho? Ya yeh kuch karna hai?") }
      ],
      explain: t("Teach me: what is a noun? Give me examples."),
      concepts: [
        { name: t('a noun is a naming word'), kw: ['name', 'naming', 'naam'] },
        { name: t('people, places and things'), kw: ['person', 'people', 'place', 'thing', 'animal', 'log', 'jagah', 'cheez'] },
        { name: t('gives examples'), kw: ['for example', 'like', 'jaise', 'book', 'delhi', 'dog', 'table', 'mother'] }
      ],
      review: { q: t('Give me one noun for a person, one for a place, one for a thing.'), kw: ['*'] }
    }
  ];

  // Things a child might show the camera. Each one gets a curious follow-up question.
  const OBJECTS = {
    mango: { q: t("A mango! Where do you think mangoes grow, on a tree or under the ground?"), expect: ['tree', 'ped', 'branch'], a: t("On big trees! And mango trees need lots of summer sun. That's why mangoes come in summer.") },
    apple: { q: t("An apple! Why do you think apples go brown when you cut them and leave them out?"), expect: ['air', 'hawa', 'oxygen', 'open'], a: t("The air reacts with the inside of the apple, like how iron rusts. Clever thinking!") },
    banana: { q: t("A banana! Why do bananas turn from green to yellow?"), expect: ['ripe', 'pak', 'time', 'old', 'sweet'], a: t("They ripen! Starch inside turns into sugar, so they get sweeter and yellow.") },
    book: { q: t("A book! What's the best story you've read? Tell me the beginning.") , expect: ['*'], a: t("That sounds amazing. You told that so clearly, like a real storyteller!") },
    pencil: { q: t("A pencil! Why do you think a pencil can be erased but a pen can't?"), expect: ['graphite', 'lead', 'top', 'surface', 'ink', 'upar'], a: t("Pencil leaves soft graphite on top of the paper, but ink soaks into it. Great detective work!") },
    leaf: { q: t("A leaf! Leaves are tiny kitchens. What do you think a leaf needs to make food?"), expect: ['sun', 'water', 'air', 'light', 'dhoop', 'paani'], a: t("Sunlight, water and air. You'd make a great scientist!") },
    ball: { q: t("A ball! Why do you think a ball bounces but an egg doesn't?"), expect: ['air', 'rubber', 'soft', 'hard', 'break', 'tootna'], a: t("A ball is stretchy and full of air, so it springs back. An egg's shell can't stretch, so it cracks!") },
    flower: { q: t("A flower! Why do you think flowers are so colourful?"), expect: ['bee', 'insect', 'butterfly', 'attract', 'titli', 'madhumakhi'], a: t("To invite bees and butterflies! They carry pollen so new seeds can grow.") },
    toy: { q: t("A toy! If you could teach this toy one new skill, what would it be, and why?"), expect: ['*'], a: t("What a fun idea. You explained your reason really well!") },
    cup: { q: t("A cup! Why does hot tea go cold if you leave it on the table?"), expect: ['heat', 'air', 'cool', 'thanda', 'escape', 'garmi'], a: t("The heat slowly moves into the cooler air around it. Heat always travels from hot to cold!") }
  };

  const RIDDLES = [
    { q: t("Riddle time! I have hands but I can't clap. What am I?", "Paheli! Mere haath hain par main taali nahi bajaa sakti. Main kaun?"), a: ['clock', 'ghadi', 'watch'], reveal: t("A clock! Clock hands just point, they never clap.") },
    { q: t("What has keys but can't open any lock?"), a: ['keyboard', 'piano'], reveal: t("A keyboard or a piano!") },
    { q: t("The more you take, the more you leave behind. What am I?"), a: ['footstep', 'steps', 'step', 'kadam'], reveal: t("Footsteps!") },
    { q: t("What gets wetter the more it dries?"), a: ['towel', 'tauliya'], reveal: t("A towel!") }
  ];

  const DEBATES = [
    { motion: t('Homework should be banned for kids under 10'), for: ["Kids learn a lot through play and family time after school.", "Too much homework makes children stressed and tired."], against: ["Homework helps you practise what you learned in class.", "It builds the habit of working on your own."] },
    { motion: t('Every child should have their own phone'), for: ["A phone helps you call your parents in an emergency.", "You can learn new things online."], against: ["Phones can distract kids from studies and play.", "Too much screen time can hurt your eyes and sleep."] },
    { motion: t('Cartoons are good for learning'), for: ["Cartoons can teach new words and ideas in a fun way.", "Some cartoons show friendship and kindness."], against: ["Most cartoons only entertain, they don't make you think.", "Watching for too long means less time to read and play."] },
    { motion: t('School should start at 10 am'), for: ["Children need more sleep to stay healthy and focused.", "Mornings would be less rushed for families."], against: ["School would end late, leaving less time to play.", "Parents who work early would find it hard."] }
  ];

  const STORY_STARTS = [
    "One rainy morning, a tiny elephant found a glowing umbrella under a neem tree.",
    "Meera's grandmother had a box that nobody was allowed to open, until today.",
    "The school bus took a wrong turn and stopped in front of a castle made of laddoos.",
    "A robot in Jaipur woke up one day and could only speak in rhymes."
  ];
  const STORY_TWISTS = [
    "Suddenly, the {w} started to glow! What do you think happened next?",
    "But then a loud knock came from inside the {w}. Who could it be?",
    "Just then, a talking parrot flew in and shouted something about the {w}. What did it say?",
    "Everyone gasped, because the {w} began to float in the air! What did they do?",
    "And then it started raining sweets! How did everyone react?"
  ];

  const SPEAK_TOPICS = [
    t('Tell me about your favourite festival and why you love it.'),
    t('If you could have any superpower, what would it be and why?'),
    t('Describe your best friend to someone who has never met them.'),
    t('What would you do if you were the principal for one day?'),
    t('Explain how to make your favourite snack.')
  ];

  const BRIDGE = [
    { hi: 'Mujhe paani chahiye.', en: ['can i have some water please', 'i want water', 'may i have some water please', 'i need water'], tip: "Adding 'please' makes it polite: 'Can I have some water, please?'" },
    { hi: 'Mera naam Aarav hai.', en: ['my name is aarav'], tip: "Simple and clear: 'My name is Aarav.'" },
    { hi: 'Kya main bahar khelne ja sakta hoon?', en: ['can i go out to play', 'can i go outside to play', 'may i go out to play'], tip: "'May I...' is the most polite way to ask permission." },
    { hi: 'Mujhe yeh samajh nahi aaya.', en: ['i did not understand this', "i didn't understand this", 'i do not understand this', "i don't understand"], tip: "In class you can say: 'Could you explain that again, please?'" },
    { hi: 'Aaj mausam bahut accha hai.', en: ['the weather is very nice today', 'today the weather is very good', 'the weather is very good today'], tip: "You can also say: 'It's a lovely day today!'" },
    { hi: 'Mera pasandeeda khel cricket hai.', en: ['my favourite game is cricket', 'my favorite game is cricket', 'my favourite sport is cricket', 'my favorite sport is cricket'], tip: "'Favourite' in Indian and British English, 'favorite' in American. Both are fine." }
  ];

  const MOODS = [
    { id: 'happy', face: '😄', label: t('Happy', 'Khush'), reply: t("Yay! I love that. What was the best part of your day so far?") },
    { id: 'okay', face: '🙂', label: t('Okay', 'Theek'), reply: t("Okay days are fine too. Is there one small thing that could make it better?") },
    { id: 'sad', face: '😢', label: t('Sad', 'Udaas'), reply: t("I'm sorry you feel sad. That's a real feeling, and it's okay. Do you want to tell me what happened? Talking to someone you trust also helps.") },
    { id: 'angry', face: '😠', label: t('Angry', 'Gussa'), reply: t("Feeling angry is normal. Let's breathe together first, then you can tell me about it.") },
    { id: 'worried', face: '😟', label: t('Worried', 'Pareshan'), reply: t("Worries feel heavy. Let's take some slow breaths, then we can think about it together.") }
  ];

  const SCENARIOS = [
    { s: t("Your friend took your pencil without asking. What would you do?"), options: [t('Grab it back'), t('Ask them politely to return it'), t('Tell the teacher straight away')], best: 1, why: t("Asking politely gives your friend a chance to fix it. Maybe they just forgot to ask!") },
    { s: t("A new student is sitting alone at lunch. What would you do?"), options: [t('Ignore them'), t('Invite them to sit with you'), t('Wait for someone else to do it')], best: 1, why: t("Being the first to be kind takes courage, and it could make someone's whole day.") },
    { s: t("You lost a game and your team is upset. What would you do?"), options: [t('Blame a teammate'), t('Say good game and plan to practise'), t('Quit the team')], best: 1, why: t("Good sports learn from losing. That's how teams get stronger.") },
    { s: t("You broke a vase at home by mistake. What would you do?"), options: [t('Hide the pieces'), t('Tell your parents honestly'), t('Blame the cat')], best: 1, why: t("Telling the truth is brave. Most parents are proud of honesty, even when something breaks.") }
  ];


  // Tap-to-reply suggestions that move each conversation forward, so a demo can be clicked through.
  // steps[i]: what a child might say at step i (a good answer, then a "not sure" answer that shows the hint).
  // explain: a full and a partial explanation. teach: one line per big idea, for Teach Vivi.
  const SAMPLES = {
    sky: { steps: [[t('It looks orange and pink!', 'Orange... ya laal?'), t("I'm not sure", 'Pata nahi')], [t('Yes, because of the sun?', 'Haan, shayad sooraj ki roshni se?'), t('Just tell me!', 'Seedha batao na!')], [t('It spreads everywhere in the sky', 'Har jagah, aasmaan mein?'), t('Into space?', 'Space mein?')]],
      explain: [t('Sunlight has all the colours mixed in. The air scatters the blue light the most, and it reaches our eyes from everywhere.', 'Sooraj ki roshni mein saare rang hote hain, hawa neela rang bikhar deti hai, aur woh hamari aankhon tak aata hai.'), t('Because the air makes the light blue', 'Kyunki hawa roshni ko neela kar deti hai')],
      teach: [t('Sunlight looks white but it has all the colours of the rainbow in it.'), t('When sunlight hits the air, the blue light bounces and scatters the most.'), t('That scattered blue light reaches our eyes from every direction, so the sky looks blue.')] },
    plants: { steps: [[t('Water, sunlight and air!'), t('Food from the shop?')], [t('The leaves!'), t("I don't know")], [t('The green colour catches sunlight'), t('Because green looks nice?')]],
      explain: [t('Plants need sunlight, water and air. The leaves make the food, and the green chlorophyll in them catches the sunlight.'), t('Plants make food with water')],
      teach: [t('A plant needs sunlight, water and air to make food.'), t('The food is made in the leaves.'), t('Leaves have green chlorophyll that catches the sunlight.')] },
    rain: { steps: [[t('It dries up and goes into the air'), t('It stays on the towel')], [t('It goes up and makes clouds'), t('Just tell me!')], [t('The drops get heavy and fall as rain'), t('The cloud breaks?')]],
      explain: [t('The sun heats water and it evaporates into vapour. Up high it cools and becomes clouds. When the drops get heavy, they fall as rain.'), t('Clouds make rain')],
      teach: [t('The sun heats water and it evaporates into vapour.'), t('The vapour goes up, cools down and turns into clouds.'), t('When the drops get too heavy, they fall as rain.')] },
    moon: { steps: [[t('It borrows light from the sun'), t('It has its own light')], [t('No, we see different parts'), t("I don't know")]],
      explain: [t('The moon reflects sunlight. It moves around the Earth, so we see different parts of its lit side, and that makes the phases.'), t('The moon gets light from the sun')],
      teach: [t('The moon has no light of its own. It reflects sunlight.'), t('The moon travels around the Earth.'), t('So we see different parts of its sunny side. Those are the phases.')] },
    float: { steps: [[t('The coin sinks!'), t('The big log sinks')], [t('Something else, like what it is made of'), t('Just tell me!')], [t('Because it has air inside, like a bowl'), t('Magic?')]],
      explain: [t("It's not about size. Metal is packed tight so a coin sinks, but a ship has a hollow shape full of air, so it floats."), t('Ships are big so they float')],
      teach: [t("Floating isn't just about size."), t('It depends on how tightly packed the material is. Wood is light, metal is heavy.'), t('A ship is hollow like a bowl, full of air, so it floats.')] },
    fractions: { steps: [[t('Half each!'), t('One full roti?')], [t('One quarter, 1/4'), t("I don't know")], [t('1/2 is bigger, fewer pieces!'), t('1/4 because 4 is bigger')]],
      explain: [t('A fraction is equal parts. The bottom number is how many parts in total, and the top number is how many you take.'), t('Fractions are pieces of a pizza')],
      teach: [t('A fraction means splitting something into equal parts.'), t('The bottom number tells how many parts there are in total.'), t('The top number tells how many parts you take.')] },
    shadows: { steps: [[t('Away from the sun, behind me'), t('Towards the sun')], [t('A dark shape'), t('Just tell me!')], [t('Because the sun is low in the evening'), t('Because I grow taller?')]],
      explain: [t('Light travels in straight lines and my body blocks it, so a dark shadow forms. When the sun is low in the evening, the shadow gets long.'), t('Shadows are dark')],
      teach: [t('Light travels in straight lines.'), t('When an object blocks the light, it makes a shadow.'), t("When the sun is low, the shadow is long. When it's high, it's short.")] },
    food: { steps: [[t('Tired and sick'), t('Super happy!')], [t('Roti and rice!'), t("I don't know")], [t('Because each colour gives different vitamins'), t('Because it looks pretty')]],
      explain: [t('Dal and paneer build our muscles, roti and rice give energy, and fruits and vegetables have vitamins that protect us. That is a balanced diet.'), t('We need healthy food')],
      teach: [t('Dal, eggs and paneer are body-building foods with protein for muscles.'), t('Roti, rice and bananas are energy foods.'), t('Fruits and vegetables have vitamins that protect us from falling sick.')] },
    nouns: { steps: [[t('Fan, book and window'), t('Running, jumping')], [t('My best friend is Riya'), t("I don't have one")], [t("It's a doing word"), t("It's a noun")]],
      explain: [t('A noun is a naming word. It names people, places and things, like mother, Delhi and table.'), t('A noun is a word')],
      teach: [t('A noun is a naming word.'), t('Nouns name people, places, animals and things.'), t('For example: mother, Delhi, dog and table are all nouns.')] }
  };
  const STARTERS = [
    t('How do plants make food?'), t('Where does rain come from?'), t('Why does the moon change shape?'), t('Why do some things float?'),
    t('What is a fraction?'), t('How are shadows made?'), t('Why do we eat different foods?'), t('What are naming words?'),
    t('Tell me a riddle!'), t('Hi Vivi! How are you?'), t('I want to teach you about rain'), t('I want to teach you about plants'), t('Why do cats purr?')
  ];
  const OBJECT_SAMPLES = { mango: t('On a tree!'), apple: t('Because of the air'), banana: t('Because it gets ripe'), book: t('Once upon a time there was a brave girl'), pencil: t('The graphite stays on top'), leaf: t('Sunlight and water'), ball: t('Because it has air inside'), flower: t('To call the bees!'), toy: t('I would teach it to dance, because it would be funny'), cup: t('The heat goes into the air') };

  const UI = {
    en: { who: "Who's using OpenMind?", child: "I'm a child", parent: "I'm a parent", talk: 'Talk to', learn: 'Learn', play: 'Play', speak: 'Speak up', feel: 'Feelings', revise: 'Revise', buddy: 'My buddy', back: 'Back', send: 'Send', typeHere: 'Type or tap the mic...' },
    hi: { who: 'OpenMind kaun use kar raha hai?', child: 'Main bachcha hoon', parent: 'Main parent hoon', talk: 'Baat karo', learn: 'Seekho', play: 'Khelo', speak: 'Bolo', feel: 'Mann ki baat', revise: 'Dohrao', buddy: 'Mera dost', back: 'Wapas', send: 'Bhejo', typeHere: 'Likho ya mic dabao...' }
  };

  return { SAMPLES, STARTERS, OBJECT_SAMPLES, TOPICS, OBJECTS, RIDDLES, DEBATES, STORY_STARTS, STORY_TWISTS, SPEAK_TOPICS, BRIDGE, MOODS, SCENARIOS, UI };
})();
