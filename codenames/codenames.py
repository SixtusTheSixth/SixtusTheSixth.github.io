# Solve Codenames by finding the words with meaning close to multiple given words, using GloVe pretrained word vectors.
# PYSCRIPT VERSION FOR WEBSITE USE
# print statements go to web console (inspect element)

# from page 8 of the paper (https://nlp.stanford.edu/pubs/glove.pdf):
# similarity score calculated by normalizing each feature across vocab & then taking cosine similarity
# Also testing pointwise mutual information for comparison

#---- setup ----#
import numpy as np
from pyscript import document # will be imported through js when page is loaded

def get_words(event):
    '''
    num_words = 0
    while True:
        try:
            num_words = int(input("How many words? ").strip())
            if num_words > 7:
                print("Please enter fewer than eight words.")
            break
        except:
            print("Please enter a valid number.")
            continue

    inp_words = []
    for w in range(num_words):
        inp_words.append(input(f"Enter word {w + 1}: ").strip().lower())
    '''
    inp_words = []

    NUM_CLOSEST_WORDS = 10 # nubmer of words to get
    VEC_FNAME = 'glove_6B_50d.txt' # using GloVe 6B 50d

    #---- HTML setup ----#
    
    '''
    # disable button
    get_words_btn = document.getElementById("getWordsButton")
    # below is not working - moved to separate function
    get_words_btn.disabled = True

    await asyncio.sleep(0) # make sure button is disabled before continuing
    '''

    # get ouptut element
    output_div = document.getElementById("output")

    # get input words
    num_words_elmt = document.getElementById("formControlNumWords")
    num_words = int(num_words_elmt.value)

    for i in range(num_words):
        cur_word_elmt = document.getElementById(f"word{i+1}")
        cur_word = cur_word_elmt.value
        if not cur_word.strip():
            output_div.innerText = "Please fill all the input areas above, then try again."
            return
        inp_words.append(cur_word.strip().lower())

    #---- load GloVe vectors ----#
    # from here: https://nlp.stanford.edu/projects/glove/
    # 400k vocab is def enough for codenames (& I don't want weird random rare words)

    wordlist = []
    vecs_raw = []
    with open(VEC_FNAME, 'r', encoding='utf-8') as f:
        split_lines = [line.strip().split() for line in f.readlines() if line.strip()]
        for line in split_lines:
                wordlist.append(line[0])
                vecs_raw.append([float(line[l]) for l in range(1, len(line))])

    ## vecs_dict = {k : np.array(v) for k, v in vecs_dict} # convert to np arrays
    vecs_raw = np.array(vecs_raw) # convert to np array
    # print(vecs_raw.shape) ## testing
    print("Finished setup. Starting algorithm...")

    #---- execute codenames ----#

    # check inputs are ok
    if any(w not in wordlist for w in inp_words):
        # print("Couldn't find one or more of the words you entered, please make sure they are spelled correctly.")
        exit()

    # normalize features across vocab
    for col in range(vecs_raw.shape[1]):
        vecs_raw[:, col] = vecs_raw[:, col] / np.linalg.norm(vecs_raw[:, col])
    print("Normalized features. Starting word similarity loop...")

    # get vectors corresponding to input words
    indices = [wordlist.index(w) for w in inp_words]
    vecs = [vecs_raw[idx] for idx in indices]

    # maximize product of cosine similarity: sim(x, w1) * sim(x, w2)
    # to penalize when it's very similar to one but not the other

    closest_words = [('', -10000),] * NUM_CLOSEST_WORDS
    for i in range(vecs_raw.shape[0]):
        # ignore input words themselves
        if i in indices: continue

        # calculate closeness score of test vector with input vectors
        test_vec = vecs_raw[i]
        close_score = 0
        for vec in vecs:
            close_score += test_vec @ vec / (np.linalg.norm(test_vec) * np.linalg.norm(vec)) # cos similarity
        
        # check for something within new maxima
        if close_score > closest_words[0][1]:
            closest_words[0] = (wordlist[i], close_score)

        # re-sort closest words list by closeness
        closest_words.sort(key=lambda x:x[1])
    
    closest_words.reverse() # so #1 is first

    #---- display output ----#
    print("Algorithm finished successfully.")
    print(f"Here are the closest {NUM_CLOSEST_WORDS} words to your input words:")
    for w in range(len(closest_words)):
        print(f"{w + 1}. {closest_words[w][0]}")

    output_div.innerText = ', '.join([w[0] for w in closest_words])
    output_div.readonly = False